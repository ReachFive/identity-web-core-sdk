import WinChan from 'winchan'
import pick from 'lodash/pick'
import isUndefined from 'lodash/isUndefined'

import { logError } from '../utils/logger'
import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties } from '../utils/transformObjectProperties'

import { ErrorResponse, Profile, SessionInfo, SignupProfile } from './models'
import { AuthOptions, AuthParameters, computeAuthOptions, resolveScope } from './authOptions'
import { AuthResult, enrichAuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { UrlParser } from './urlParser'
import { popupSize } from './providerPopupSize'
import { createHttpClient, HttpClient } from './httpClient'
import { computePkceParams, PkceParams } from './pkceService'
import { encodePublicKeyCredentialCreationOptions, serializePublicKeyCredential, publicKeyCredentialType, PublicKey } from './webAuthnService'

export type SignupParams = {
  data: SignupProfile
  returnToAfterEmailConfirmation?: string
  saveCredentials?: boolean
  auth?: AuthOptions
  redirectUrl?: string
}
export type UpdateEmailParams = { accessToken: string; email: string; redirectUrl?: string }
export type EmailVerificationParams = { accessToken: string; redirectUrl?: string; returnToAfterEmailConfirmation?: string }
export type PhoneNumberVerificationParams = { accessToken: string }

type LoginWithPasswordOptions = { password: string; saveCredentials?: boolean; auth?: AuthOptions }
type EmailLoginWithPasswordParams = LoginWithPasswordOptions & { email: string }
type PhoneNumberLoginWithPasswordParams = LoginWithPasswordOptions & { phoneNumber: string }

export type LoginWithPasswordParams = EmailLoginWithPasswordParams | PhoneNumberLoginWithPasswordParams

export type LoginWithCredentialsParams = {
  mediation?: 'silent' | 'optional' | 'required'
  auth?: AuthOptions
}

type EmailRequestPasswordResetParams = {
  email: string
  redirectUrl?: string
  loginLink?: string
  returnToAfterPasswordReset?: string
}
type SmsRequestPasswordResetParams = { phoneNumber: string }
export type RequestPasswordResetParams = EmailRequestPasswordResetParams | SmsRequestPasswordResetParams

type AccessTokenUpdatePasswordParams = {
  accessToken?: string
  password: string
  oldPassword?: string
  userId?: string
}

type EmailVerificationCodeUpdatePasswordParams = {
  accessToken?: string
  email: string
  verificationCode: string
  password: string
}

type SmsVerificationCodeUpdatePasswordParams = {
  accessToken?: string
  phoneNumber: string
  verificationCode: string
  password: string
}

export type UpdatePasswordParams =
  | AccessTokenUpdatePasswordParams
  | EmailVerificationCodeUpdatePasswordParams
  | SmsVerificationCodeUpdatePasswordParams

export type PasswordlessParams = {
  authType: 'magic_link' | 'sms'
  email?: string
  phoneNumber?: string
}

export type VerifyPasswordlessParams = PasswordlessParams & { verificationCode: string }

export type ApiClientConfig = {
  clientId: string
  domain: string
  language?: string
  scope?: string
  sso: boolean
  pkceEnabled?: boolean
}

export type TokenRequestParameters = {
  code: string
  redirectUri: string
  persistent?: boolean // Whether the remember me is enabled
}

/**
 * Identity Rest API Client
 */
export default class ApiClient {
  constructor(props: { config: ApiClientConfig; eventManager: IdentityEventManager; urlParser: UrlParser }) {
    this.config = props.config
    this.eventManager = props.eventManager
    this.urlParser = props.urlParser
    this.baseUrl = `https://${this.config.domain}/identity/v1`
    this.http = createHttpClient({
      baseUrl: this.baseUrl,
      language: this.config.language,
      acceptCookies: this.config.sso
    })
    this.authorizeUrl = `https://${this.config.domain}/oauth/authorize`
    this.tokenUrl = `https://${this.config.domain}/oauth/token`
    this.popupRelayUrl = `https://${this.config.domain}/popup/relay`

    this.initCordovaCallbackIfNecessary()
  }

  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager
  private urlParser: UrlParser
  private baseUrl: string
  private authorizeUrl: string
  private tokenUrl: string
  private popupRelayUrl: string

  loginWithSocialProvider(provider: string, opts: AuthOptions = {}): Promise<void> {
    const authParams = this.authParams(opts, { acceptPopupMode: true })

    return this.getPkceParams(authParams).then(maybeChallenge => {
      const params = {
        ...authParams,
        provider,
        ...maybeChallenge
      }
      if ('cordova' in window) {
        return this.loginWithCordovaInAppBrowser(params)
      } else if (params.display === 'popup') {
        return this.loginWithPopup(params)
      } else {
        return this.loginWithRedirect(params)
      }
    })
  }

  exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters): Promise<void> {
    return this.http
      .post<AuthResult>(this.tokenUrl, {
        body: {
          clientId: this.config.clientId,
          grantType: 'authorization_code',
          codeVerifier: sessionStorage.getItem('verifier_key'),
          ...params
        }
      })
      .then(result => this.eventManager.fireEvent('authenticated', result))
  }

  loginFromSession(opts: AuthOptions = {}): Promise<void> {
    if (!this.config.sso && !opts.idTokenHint) {
      return Promise.reject(
        new Error("Cannot call 'loginFromSession' without 'idTokenHint' parameter if SSO is not enabled.")
      )
    }
    return this.loginWithRedirect({
      ...this.authParams(opts),
      prompt: 'none'
    })
  }

  checkSession(opts: AuthOptions = {}): Promise<AuthResult> {
    if (!this.config.sso && !opts.idTokenHint) {
      return Promise.reject(
        new Error("Cannot call 'loginFromSession' without 'idTokenHint' parameter if SSO is not enabled.")
      )
    }
    const authorizationUrl = this.getAuthorizationUrl({
      ...this.authParams(opts),
      responseMode: 'web_message',
      prompt: 'none'
    })

    const iframe = document.createElement('iframe')
    iframe.setAttribute('width', '0')
    iframe.setAttribute('height', '0')
    iframe.setAttribute('src', authorizationUrl)
    document.body.appendChild(iframe)

    return new Promise<AuthResult>((resolve, reject) => {
      // An error on timeout could be added, but the need is not obvious for this function.
      const listener = (event: MessageEvent) => {
        if (event.origin !== `https://${this.config.domain}`) return
        const data = camelCaseProperties(event.data)
        if (data.type === 'authorization_response') {
          if (AuthResult.isAuthResult(data.response)) {
            this.eventManager.fireEvent('authenticated', data.response)
            resolve(enrichAuthResult(data.response))
          } else if (ErrorResponse.isErrorResponse(data.response)) {
            // The 'authentication_failed' event must not be triggered because it is not a real authentication failure.
            reject(data.response)
          } else {
            reject({
              error: 'unexpected_error',
              errorDescription: 'Unexpected error occurred'
            })
          }
          window.removeEventListener('message', listener)
        }
      }
      window.addEventListener('message', listener, false)
    })
  }

  logout(opts: { redirectTo?: string; removeCredentials?: boolean } = {}): void {
    if (navigator.credentials && navigator.credentials.preventSilentAccess && opts.removeCredentials === true) {
      navigator.credentials.preventSilentAccess()
    }
    window.location.assign(`${this.baseUrl}/logout?${toQueryString(opts)}`)
  }

  private loginWithRedirect(queryString: Record<string, string | boolean | undefined>): Promise<void> {
    window.location.assign(this.getAuthorizationUrl(queryString))
    return Promise.resolve()
  }

  private getAuthorizationUrl(queryString: Record<string, string | boolean | undefined>): string {
    return `${this.authorizeUrl}?${toQueryString(queryString)}`
  }

  private loginWithCordovaInAppBrowser(opts: QueryString): Promise<void> {
    return this.openInCordovaSystemBrowser(
      this.getAuthorizationUrl({
        ...opts,
        display: 'page'
      })
    )
  }

  private openInCordovaSystemBrowser(url: string): Promise<void> {
    return this.getAvailableBrowserTabPlugin().then(maybeBrowserTab => {
      if (!window.cordova) {
        throw new Error('Cordova environnement not detected.')
      }

      if (maybeBrowserTab) {
        maybeBrowserTab.openUrl(url, () => {}, logError)
      } else if (window.cordova.InAppBrowser) {
        if (window.cordova.platformId === 'ios') {
          // Open a webview (to pass Apple validation tests)
          window.cordova.InAppBrowser.open(url, '_blank')
        } else {
          // Open the system browser
          window.cordova.InAppBrowser.open(url, '_system')
        }
      } else {
        throw new Error('Cordova plugin "inappbrowser" is required.')
      }
    })
  }

  private getAvailableBrowserTabPlugin(): Promise<BrowserTab | undefined> {
    return new Promise((resolve, reject) => {
      const cordova = window.cordova

      if (!cordova || !cordova.plugins || !cordova.plugins.browsertab) return resolve(undefined)

      const plugin = cordova.plugins.browsertab

      plugin.isAvailable(isAvailable => resolve(isAvailable ? plugin : undefined), reject)
    })
  }

  private initCordovaCallbackIfNecessary(): void {
    if (!window.cordova) return
    if (window.handleOpenURL) return

    window.handleOpenURL = url => {
      const cordova = window.cordova
      if (!cordova) return

      const parsed = this.urlParser.checkUrlFragment(url)

      if (parsed && cordova.plugins && cordova.plugins.browsertab) {
        cordova.plugins.browsertab.close()
      }
    }
  }

  private loginWithPopup(opts: AuthOptions & { provider: string }): Promise<void> {
    type WinChanResponse<D> = { success: true; data: D } | { success: false; data: ErrorResponse }

    WinChan.open(
      {
        url: `${this.authorizeUrl}?${toQueryString(opts)}`,
        relay_url: this.popupRelayUrl,
        window_features: this.computeProviderPopupOptions(opts.provider)
      },
      (err: string, result: WinChanResponse<object>) => {
        if (err) {
          logError(err)
          this.eventManager.fireEvent('authentication_failed', {
            errorDescription: 'Unexpected error occurred',
            error: 'server_error'
          })
          return
        }

        const r = camelCaseProperties(result) as WinChanResponse<AuthResult>

        if (r.success) {
          this.authenticatedHandler(opts, r.data)
        } else {
          this.eventManager.fireEvent('authentication_failed', r.data)
        }
      }
    )
    return Promise.resolve()
  }

  loginWithPassword(params: LoginWithPasswordParams): Promise<void> {
    // Whether the credentials will be stored in the browser
    const saveCredentials = !isUndefined(params.saveCredentials) && params.saveCredentials

    const loginPromise =
      window.cordova || saveCredentials
        ? this.loginWithPasswordByOAuth(params)
        : this.loginWithPasswordByRedirect(params)

    const resultPromise =
      saveCredentials
        ? loginPromise.then(() => this.storeCredentialsInBrowser(params))
        : loginPromise

    return resultPromise.catch((err: any) => {
      if (err.error) {
        this.eventManager.fireEvent('login_failed', err)
      }
      throw err
    })
  }

  private storeCredentialsInBrowser(params: LoginWithPasswordParams): Promise<void> {
    if (navigator.credentials && navigator.credentials.create && navigator.credentials.store) {
      const credentialParams = {
        password: {
          password: params.password,
          id: hasLoggedWithEmail(params) ? params.email : params.phoneNumber
        }
      }

      return navigator.credentials
        .create(credentialParams)
        .then(credentials =>
          !isUndefined(credentials) && credentials
            ? navigator.credentials.store(credentials).then(() => {})
            : Promise.resolve()
        )
    } else {
      logError('Unsupported Credentials Management API')
      return Promise.resolve()
    }
  }

  private loginWithPasswordByOAuth(params: LoginWithPasswordParams): Promise<void> {
    const auth = params.auth

    return this.http
      .post<AuthResult>(this.tokenUrl, {
        body: {
          clientId: this.config.clientId,
          grantType: 'password',
          username: hasLoggedWithEmail(params) ? params.email : params.phoneNumber,
          password: params.password,
          scope: this.resolveScope(auth),
          ...pick(auth, 'origin')
        }
      })
      .then(result => this.eventManager.fireEvent('authenticated', result))
  }

  private loginWithPasswordByRedirect({ auth = {}, ...rest }: LoginWithPasswordParams): Promise<void> {
    return this.http
      .post<{ tkn: string }>('/password/login', {
        body: {
          clientId: this.config.clientId,
          scope: this.resolveScope(auth),
          ...rest
        }
      })
      .then(({ tkn }) => this.loginWithPasswordCallback(tkn, auth))
  }

  private loginWithPasswordCallback(tkn: string, auth: AuthOptions = {}): void {
    const authParams = this.authParams(auth)

    this.getPkceParams(authParams).then(maybeChallenge => {
      const queryString = toQueryString({
        ...authParams,
        tkn,
        ...maybeChallenge,
      })
      window.location.assign(`${this.baseUrl}/password/callback?${queryString}`)
    })
  }

  startPasswordless(params: PasswordlessParams, auth: AuthOptions = {}): Promise<void> {
    const { authType, email, phoneNumber } = params

    return this.http.post('/passwordless/start', {
      body: {
        ...this.authParams(auth),
        authType,
        email,
        phoneNumber
      }
    })
  }

  private loginWithVerificationCode(params: VerifyPasswordlessParams, auth: AuthOptions): void {
    const queryString = toQueryString({
      ...this.authParams(auth),
      ...params
    })
    window.location.assign(`${this.baseUrl}/passwordless/verify?${queryString}`)
  }

  verifyPasswordless(params: VerifyPasswordlessParams, auth: AuthOptions = {}): Promise<void> {
    return this.http
      .post('/verify-auth-code', { body: params })
      .then(() => this.loginWithVerificationCode(params, auth))
      .catch(err => {
        if (err.error) this.eventManager.fireEvent('login_failed', err)
        throw err
      })
  }

  signup(params: SignupParams): Promise<void> {
    const { data, auth, redirectUrl, returnToAfterEmailConfirmation } = params
    const acceptTos = auth && auth.acceptTos

    const signupPromise = window.cordova
      ? this.http
          .post<AuthResult>(`${this.baseUrl}/signup-token`, {
            body: {
              clientId: this.config.clientId,
              redirectUrl,
              scope: this.resolveScope(auth),
              ...pick(auth, 'origin'),
              data,
              returnToAfterEmailConfirmation,
            }
          })
          .then(result => this.eventManager.fireEvent('authenticated', result))
      : this.http
          .post<{ tkn: string }>('/signup', {
            body: {
              clientId: this.config.clientId,
              redirectUrl,
              scope: this.resolveScope(auth),
              acceptTos,
              data,
              returnToAfterEmailConfirmation,
            }
          })
          .then(({ tkn }) => this.loginWithPasswordCallback(tkn, auth))

    const saveCredentials = !isUndefined(params.saveCredentials) && params.saveCredentials

    const loginParams: LoginWithPasswordParams | undefined = !isUndefined(data.phoneNumber)
      ? { password: data.password, phoneNumber: data.phoneNumber }
      : !isUndefined(data.email)
      ? { password: data.password, email: data.email }
      : undefined

    const resultPromise =
      saveCredentials && !isUndefined(loginParams)
        ? signupPromise.then(() => this.storeCredentialsInBrowser(loginParams))
        : signupPromise

    return resultPromise.catch(err => {
      if (err.error) {
        this.eventManager.fireEvent('signup_failed', err)
      }
      throw err
    })
  }

  sendEmailVerification(params: EmailVerificationParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post('/send-email-verification', { body: { ...data }, accessToken })
  }

  sendPhoneNumberVerification(params: PhoneNumberVerificationParams): Promise<void> {
    const { accessToken } = params
    return this.http.post('/send-phone-number-verification', { accessToken })
  }

  requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
    return this.http.post('/forgot-password', {
      body: {
        clientId: this.config.clientId,
        ...params
      }
    })
  }

  updatePassword(params: UpdatePasswordParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post('/update-password', {
      body: { clientId: this.config.clientId, ...data },
      accessToken
    })
  }

  updateEmail(params: { accessToken: string; email: string; redirectUrl?: string }): Promise<void> {
    const { accessToken, email, redirectUrl } = params
    return this.http.post('/update-email', { body: { email, redirectUrl }, accessToken })
  }

  updatePhoneNumber(params: { accessToken: string; phoneNumber: string }): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post('/update-phone-number', { body: data, accessToken })
  }

  verifyPhoneNumber({
    accessToken,
    ...data
  }: {
    accessToken: string
    phoneNumber: string
    verificationCode: string
  }): Promise<void> {
    const { phoneNumber } = data
    return this.http
      .post('/verify-phone-number', { body: data, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', { phoneNumber, phoneNumberVerified: true }))
  }

  unlink({ accessToken, ...data }: { accessToken: string; identityId: string; fields?: string }): Promise<void> {
    return this.http.post('/unlink', { body: data, accessToken })
  }

  refreshTokens({ accessToken }: { accessToken: string }): Promise<AuthResult> {
    return this.http
      .post<AuthResult>('/token/access-token', {
        body: {
          clientId: this.config.clientId,
          accessToken
        }
      })
      .then(enrichAuthResult)
  }

  getUser({ accessToken, fields }: { accessToken: string; fields?: string }): Promise<Profile> {
    return this.http.get<Profile>('/me', { query: { fields }, accessToken })
  }

  updateProfile({
    accessToken,
    redirectUrl,
    data
  }: {
    accessToken: string
    redirectUrl?: string
    data: Profile
  }): Promise<void> {
    return this.http
      .post('/update-profile', { body: { ...data, redirectUrl }, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', data))
  }

  loginWithCustomToken({ token, auth }: { token: string; auth: AuthOptions }): void {
    const queryString = toQueryString({
      ...this.authParams(auth),
      token
    })
    window.location.assign(`${this.baseUrl}/custom-token/login?${queryString}`)
  }

  loginWithCredentials(params: LoginWithCredentialsParams): Promise<void> {
    if (navigator.credentials && navigator.credentials.get) {
      const request: CredentialRequestOptions = {
        password: true,
        mediation: params.mediation || 'silent'
      }
      return navigator.credentials.get(request).then(credentials => {
        if (!isUndefined(credentials) && credentials instanceof PasswordCredential && credentials.password) {
          const loginParams: EmailLoginWithPasswordParams = {
            email: credentials.id,
            password: credentials.password,
            auth: params.auth
          }
          return this.loginWithPasswordByOAuth(loginParams)
        }
        return Promise.reject(new Error('Invalid credentials'))
      })
    } else {
      return Promise.reject(new Error('Unsupported Credentials Management API'))
    }
  }

  addNewWebAuthnDevice(accessToken: string): Promise<void> {
    const body = {
      origin: window.location.origin,
      friendlyName: window.navigator.platform
    }

    return this.http
      .post<PublicKey>('/webauthn/makeCredentials', { body, accessToken })
      .then(response => {
        const options = encodePublicKeyCredentialCreationOptions(response.publicKey)

        return navigator.credentials.create({ publicKey: options })
      })
      .then(credentials => {
        if (!credentials || credentials.type !== publicKeyCredentialType) {
          throw new Error('Unable to register invalid public key crendentials.')
        }

        const serializedCredentials = serializePublicKeyCredential(credentials)

        return this.http
          .post<void>('/webauthn/credentials', { body: { ...serializedCredentials }, accessToken })
          .catch(error => { throw error })
      })
      .catch(error => {
        if (error.error) this.eventManager.fireEvent('login_failed', error)

        throw error
      })
  }

  getSessionInfo(): Promise<SessionInfo> {
    return this.http.get<SessionInfo>('/sso/data', {
      query: { clientId: this.config.clientId },
      withCookies: true
    })
  }

  private getPkceParams(authParams: AuthParameters): Promise<PkceParams | {}> {
    if (this.config.pkceEnabled) {
      if (authParams.responseType === 'token') throw new Error('Cannot use implicit flow when PKCE is enabled')
      else return computePkceParams()
    } else return Promise.resolve({})
  }

  private authenticatedHandler = ({ responseType, redirectUri }: AuthOptions, response: AuthResult) => {
    if (responseType === 'code') {
      window.location.assign(`${redirectUri}?code=${response.code}`)
    } else {
      this.eventManager.fireEvent('authenticated', response)
    }
  }

  private computeProviderPopupOptions(provider: string): string {
    try {
      const opts = popupSize(provider)
      const left = Math.max(0, (screen.width - opts.width) / 2)
      const top = Math.max(0, (screen.height - opts.height) / 2)
      const width = Math.min(screen.width, opts.width)
      const height = Math.min(screen.height, opts.height)
      return `menubar=0,toolbar=0,resizable=1,scrollbars=1,width=${width},height=${height},top=${top},left=${left}`
    } catch (e) {
      return 'menubar=0,toolbar=0,resizable=1,scrollbars=1,width=960,height=680'
    }
  }

  private resolveScope(opts: AuthOptions = {}) {
    return resolveScope(opts, this.config.scope)
  }

  private authParams(opts: AuthOptions, { acceptPopupMode = false } = {}) {
    return {
      clientId: this.config.clientId,
      ...computeAuthOptions(opts, { acceptPopupMode }, this.config.scope)
    }
  }
}

function hasLoggedWithEmail(params: LoginWithPasswordParams): params is EmailLoginWithPasswordParams {
  return (params as EmailLoginWithPasswordParams).email !== undefined
}
