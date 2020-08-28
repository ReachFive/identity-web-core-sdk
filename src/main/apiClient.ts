import WinChan from 'winchan'
import pick from 'lodash/pick'
import isUndefined from 'lodash/isUndefined'

import { logError } from '../utils/logger'
import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties } from '../utils/transformObjectProperties'

import { ErrorResponse, Profile, SessionInfo, SignupProfile, OpenIdUser } from './models'
import { AuthOptions, AuthParameters, computeAuthOptions, resolveScope } from './authOptions'
import { AuthResult, enrichAuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { UrlParser } from './urlParser'
import { popupSize } from './providerPopupSize'
import { createHttpClient, HttpClient } from './httpClient'
import { computePkceParams, PkceParams } from './pkceService'
import {
  encodePublicKeyCredentialCreationOptions, encodePublicKeyCredentialRequestOptions,
  serializeRegistrationPublicKeyCredential, serializeAuthenticationPublicKeyCredential,
  RegistrationOptions, CredentialRequestOptionsSerialized, DeviceCredential,
  publicKeyCredentialType
} from './webAuthnService'

export type SignupParams = {
  data: SignupProfile
  returnToAfterEmailConfirmation?: string
  saveCredentials?: boolean
  auth?: AuthOptions
  redirectUrl?: string
  useRedirect?: boolean
}
export type UpdateEmailParams = { accessToken: string; email: string; redirectUrl?: string }
export type EmailVerificationParams = { accessToken: string; redirectUrl?: string; returnToAfterEmailConfirmation?: string }
export type PhoneNumberVerificationParams = { accessToken: string }

type LoginWithPasswordOptions = { useRedirect?: boolean; password: string; saveCredentials?: boolean; auth?: AuthOptions }
type EmailLoginWithPasswordParams = LoginWithPasswordOptions & { email: string }
type PhoneNumberLoginWithPasswordParams = LoginWithPasswordOptions & { phoneNumber: string }

export type LoginWithPasswordParams = EmailLoginWithPasswordParams | PhoneNumberLoginWithPasswordParams

export type LoginWithCredentialsParams = {
  mediation?: 'silent' | 'optional' | 'required'
  auth?: AuthOptions
}

type EmailLoginWithWebAuthnParams = { useRedirect?: boolean; email: string, auth?: AuthOptions }
type PhoneNumberLoginWithWebAuthnParams = { useRedirect?: boolean; phoneNumber: string, auth?: AuthOptions  }
export type LoginWithWebAuthnParams = EmailLoginWithWebAuthnParams | PhoneNumberLoginWithWebAuthnParams

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

type AuthenticationToken = { tkn: string }

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

  getSignupData(signupToken: string): Promise<OpenIdUser> {
    return this.http.get<OpenIdUser>(`${this.baseUrl}/signup/data`, {
      query: {
        clientId: this.config.clientId,
        token: signupToken
      }
    })
  }

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

  exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters): Promise<AuthResult> {
    return this.http
      .post<AuthResult>(this.tokenUrl, {
        body: {
          clientId: this.config.clientId,
          grantType: 'authorization_code',
          codeVerifier: sessionStorage.getItem('verifier_key'),
          ...params
        }
      })
      .then(result => {
        this.eventManager.fireEvent('authenticated', result)
        return enrichAuthResult(result)
      })
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

    return this.getWebMessage(
      authorizationUrl,
      `https://${this.config.domain}`,
      opts.redirectUri || ""
    )
  }

  private getWebMessage(
    src: string,
    origin: string,
    redirectUri?: string,
  ): Promise<AuthResult> {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('width', '0')
    iframe.setAttribute('height', '0')
    iframe.setAttribute('style', 'display:none;')
    iframe.setAttribute('src', src)

    return new Promise<AuthResult>((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        // Verify the event's origin
        if (event.origin !== origin) return

        // Verify the event's syntax
        const data = camelCaseProperties(event.data)
        if (data.type !== 'authorization_response') return

        // The iframe is no longer needed, clean it up ..
        if (window.document.body.contains(iframe)) {
          window.document.body.removeChild(iframe)
        }

        // .. and close the event's source
        if (event.source && "close" in event.source) {
          event.source.close()
        }

        const result = data.response

        if (AuthResult.isAuthResult(result)) {
          if (result.code) {
            resolve(this.exchangeAuthorizationCodeWithPkce({
              code: result.code,
              redirectUri: redirectUri || ""
            }))
          } else {
            this.eventManager.fireEvent('authenticated', data.response)
            resolve(enrichAuthResult(data.response))
          }
        } else if (ErrorResponse.isErrorResponse(result)) {
          // The 'authentication_failed' event must not be triggered because it is not a real authentication failure.
          reject(result)
        } else {
          reject({
            error: 'unexpected_error',
            errorDescription: 'Unexpected error occurred'
          })
        }
        window.removeEventListener('message', listener, false)
      }

      window.addEventListener('message', listener, false)
      document.body.appendChild(iframe)
    })
  }

  logout(opts: { redirectTo?: string; removeCredentials?: boolean } = {}): void {
    if (navigator.credentials && navigator.credentials.preventSilentAccess && opts.removeCredentials === true) {
      navigator.credentials.preventSilentAccess()
    }
    window.location.assign(`${this.baseUrl}/logout?${toQueryString(opts)}`)
  }

  private loginWithRedirect(queryString: Record<string, string | boolean | undefined>): Promise<void> {
    redirect(this.getAuthorizationUrl(queryString))
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
        return Promise.reject(new Error('Cordova environnement not detected.'))
      }

      if (maybeBrowserTab) {
        maybeBrowserTab.openUrl(url, () => {}, logError)
        return Promise.resolve()
      } else if (window.cordova.InAppBrowser) {
        if (window.cordova.platformId === 'ios') {
          // Open a webview (to pass Apple validation tests)
          window.cordova.InAppBrowser.open(url, '_blank')
        } else {
          // Open the system browser
          window.cordova.InAppBrowser.open(url, '_system')
        }

        return Promise.resolve()
      } else {
        return Promise.reject(new Error('Cordova plugin "inappbrowser" is required.'))
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
        window_features: computeProviderPopupOptions(opts.provider)
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

  loginWithPassword(params: LoginWithPasswordParams): Promise<AuthResult | void> {
    const { auth = {}, ...rest } = params

    const loginPromise =
      window.cordova
        ? this.ropcPasswordLogin(params).then(() => this.storeCredentialsInBrowser(params))
        : this.http
            .post<AuthenticationToken>('/password/login', {
              body: {
                clientId: this.config.clientId,
                scope: this.resolveScope(auth),
                ...rest
              }
            })
            .then(tkn => this.storeCredentialsInBrowser(params).then(() => tkn))
            .then(({ tkn }) => this.loginCallback(tkn, auth, !!params.useRedirect))

    return (loginPromise as Promise<AuthResult | void>).catch((err: any) => {
      if (err.error) {
        this.eventManager.fireEvent('login_failed', err)
      }
      return Promise.reject(new Error(err.error))
    })
  }

  private storeCredentialsInBrowser(params: LoginWithPasswordParams): Promise<void> {
    if (!params.saveCredentials) return Promise.resolve()

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

  private ropcPasswordLogin(params: LoginWithPasswordParams): Promise<void> {
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

  private loginCallback(tkn: string, auth: AuthOptions = {}, useRedirect: boolean = false): Promise<AuthResult | void> {
    const authParams = this.authParams(auth)

    return this.getPkceParams(authParams).then(maybeChallenge => {
      const queryString = toQueryString({
        ...authParams,
        ...maybeChallenge,
        ...(useRedirect) ? {} : {
          responseMode: 'web_message',
          prompt: 'none'
        },
        tkn
      })

      if (useRedirect) {
        return redirect(`${this.authorizeUrl}?${queryString}`)
      } else {
        return this.getWebMessage(
          `${this.authorizeUrl}?${queryString}`,
          `https://${this.config.domain}`,
          auth.redirectUri || ""
        ) as Promise<AuthResult | void>
      }
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
        return Promise.reject(new Error(err.error))
      })
  }

  signup(params: SignupParams): Promise<AuthResult | void> {
    const { data, auth, redirectUrl, returnToAfterEmailConfirmation, useRedirect, saveCredentials } = params

    const loginParams: LoginWithPasswordParams = {
      ...(data.phoneNumber)
        ? { phoneNumber: data.phoneNumber }
        : { email: data.email || "" },
      password: data.password,
      saveCredentials,
      auth
    }

    const resultPromise = window.cordova
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
          .then(() => this.storeCredentialsInBrowser(loginParams))
      : this.http
          .post<AuthenticationToken>('/signup', {
            body: {
              clientId: this.config.clientId,
              redirectUrl,
              scope: this.resolveScope(auth),
              data,
              returnToAfterEmailConfirmation,
            }
          })
          .then(tkn => this.storeCredentialsInBrowser(loginParams).then(() => tkn))
          .then(({ tkn }) => this.loginCallback(tkn, auth, !!useRedirect))

    return (resultPromise as Promise<AuthResult | void>).catch(err => {
      if (err.error) {
        this.eventManager.fireEvent('signup_failed', err)
      }
      return Promise.reject(new Error(err.error))
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
          return this.ropcPasswordLogin(loginParams)
        }
        return Promise.reject(new Error('Invalid credentials'))
      })
    } else {
      return Promise.reject(new Error('Unsupported Credentials Management API'))
    }
  }

  addNewWebAuthnDevice(accessToken: string, friendlyName?: string): Promise<void> {
    if (navigator.credentials && navigator.credentials.create) {
      const body = {
        origin: window.location.origin,
        friendlyName: friendlyName || window.navigator.platform
      }

      return this.http
        .post<RegistrationOptions>('/webauthn/registration-options', { body, accessToken })
        .then(response => {
          const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey)

          return navigator.credentials.create({ publicKey })
        })
        .then(credentials => {
          if (!credentials || credentials.type !== publicKeyCredentialType) {
            return Promise.reject(new Error('Unable to register invalid public key credentials.'))
          }

          const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials)

          return this.http.post<void>('/webauthn/registration', { body: { ...serializedCredentials }, accessToken })
        })
        .catch(err => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)

          return Promise.reject(new Error(err.error))
        })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  loginWithWebAuthn(params: LoginWithWebAuthnParams): Promise<AuthResult | void> {
    if (navigator.credentials && navigator.credentials.get) {
      const body = {
        clientId: this.config.clientId,
        origin: window.location.origin,
        scope: this.resolveScope(params.auth),
        email: (params as EmailLoginWithWebAuthnParams).email,
        phoneNumber: (params as PhoneNumberLoginWithWebAuthnParams).phoneNumber
      }

      return this.http
        .post<CredentialRequestOptionsSerialized>('/webauthn/authentication-options', { body })
        .then(response => {
          const options = encodePublicKeyCredentialRequestOptions(response.publicKey)

          return navigator.credentials.get({ publicKey: options })
        })
        .then(credentials => {
            if (!credentials || credentials.type !== publicKeyCredentialType) {
              return Promise.reject(new Error('Unable to authenticate with invalid public key credentials.'))
            }

            const serializedCredentials = serializeAuthenticationPublicKeyCredential(credentials)

            return this.http
              .post<AuthenticationToken>('/webauthn/authentication', { body: { ...serializedCredentials } })
              .then(response => this.loginCallback(response.tkn, params.auth, !!params.useRedirect))
        })
        .catch(err => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)

          return Promise.reject(new Error(err.error))
        })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  listWebAuthnDevices(accessToken: string): Promise<DeviceCredential[]> {
    return this.http.get<DeviceCredential[]>('/webauthn/registration', { accessToken })
  }

  removeWebAuthnDevice(accessToken: string, deviceId: string): Promise<void> {
    return this.http.remove<void>(`/webauthn/registration/${deviceId}`, { accessToken })
  }

  getSessionInfo(): Promise<SessionInfo> {
    return this.http.get<SessionInfo>('/sso/data', {
      query: { clientId: this.config.clientId },
      withCookies: true
    })
  }

  private getPkceParams(authParams: AuthParameters): Promise<PkceParams | {}> {
    if (this.config.pkceEnabled) {
      if (authParams.responseType === 'token')
        return Promise.reject(new Error('Cannot use implicit flow when PKCE is enabled'))
      else
        return computePkceParams()
    } else
      return Promise.resolve({})
  }

  private authenticatedHandler = ({ responseType, redirectUri }: AuthOptions, response: AuthResult) => {
    if (responseType === 'code') {
      window.location.assign(`${redirectUri}?code=${response.code}`)
    } else {
      this.eventManager.fireEvent('authenticated', response)
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

function redirect(location: string): Promise<void> {
  window.location.assign(location)
  return Promise.resolve()
}

function hasLoggedWithEmail(params: LoginWithPasswordParams): params is EmailLoginWithPasswordParams {
  return (params as EmailLoginWithPasswordParams).email !== undefined
}

function computeProviderPopupOptions(provider: string): string {
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
