import WinChan from 'winchan'
import pick from 'lodash/pick'
import isUndefined from 'lodash/isUndefined'
import { logError } from '../utils/logger'
import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties } from '../utils/transformObjectProperties'
import {
  ErrorResponse,
  SessionInfo,
  SignupProfile,
  PasswordlessResponse,
  Scope
} from './models'
import { AuthOptions, AuthParameters, computeAuthOptions, resolveScope } from './authOptions'
import { AuthResult, enrichAuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { popupSize } from './providerPopupSize'
import { HttpClient } from './httpClient'
import { computePkceParams, PkceParams } from './pkceService'
import { randomBase64String } from '../utils/random'
import { ApiClientConfig } from './main'

export type SignupParams = {
  data: SignupProfile
  returnToAfterEmailConfirmation?: string
  saveCredentials?: boolean
  auth?: AuthOptions
  redirectUrl?: string
  captchaToken?: string
}
type LoginWithPasswordOptions = { password: string; saveCredentials?: boolean; auth?: AuthOptions, captchaToken?: string }
type EmailLoginWithPasswordParams = LoginWithPasswordOptions & { email: string }
type PhoneNumberLoginWithPasswordParams = LoginWithPasswordOptions & { phoneNumber: string }

export type LoginWithPasswordParams = EmailLoginWithPasswordParams | PhoneNumberLoginWithPasswordParams
export type LoginWithCredentialsParams = {
  mediation?: 'silent' | 'optional' | 'required'
  auth?: AuthOptions
}

export type SingleFactorPasswordlessParams = {
  authType: 'magic_link' | 'sms'
  email?: string
  phoneNumber?: string
  captchaToken?: string
}

export type VerifyPasswordlessParams = {
  authType: 'magic_link' | 'sms'
  email?: string
  phoneNumber?: string
  verificationCode: string
}

export type TokenRequestParameters = {
  code: string
  redirectUri: string
  persistent?: boolean // Whether the remember me is enabled
}

type AuthenticationToken = { tkn: string }

export type RefreshTokenParams = { accessToken: string } | { refreshToken: string, scope?: Scope }

/**
 * Identity Rest API Client
 */
export default class OAuthClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager
  private authorizeUrl: string
  private tokenUrl: string
  private popupRelayUrl: string

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager
    this.authorizeUrl = `https://${this.config.domain}/oauth/authorize`
    this.tokenUrl = `https://${this.config.domain}/oauth/token`
    this.popupRelayUrl = `https://${this.config.domain}/popup/relay`
  }

  loginWithSocialProvider(provider: string, opts: AuthOptions = {}): Promise<void | InAppBrowser> {
    const authParams = this.authParams({
      ...opts,
      useWebMessage: false
    }, { acceptPopupMode: true })

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
      .then(authResult => {
        this.eventManager.fireEvent('authenticated', authResult)
        return enrichAuthResult(authResult)
      })
  }

  loginFromSession(opts: AuthOptions = {}): Promise<void> {
    if (!this.config.sso)
      return Promise.reject(
        new Error("Cannot call 'loginFromSession' if SSO is not enabled.")
      )

    const authParams = this.authParams({
      ...opts,
      useWebMessage: false,
      prompt: 'none',
    })

    return this.getPkceParams(authParams).then(maybeChallenge => {
      const params = {
        ...authParams,
        ...maybeChallenge,
      }

      return this.loginWithRedirect(params)
    })
  }

  checkSession(opts: AuthOptions = {}): Promise<AuthResult> {
    if (!this.config.sso)
      return Promise.reject(
        new Error("Cannot call 'checkSession' if SSO is not enabled.")
      )

    const authParams = this.authParams({
      ...opts,
      responseType: 'code',
      useWebMessage: true,
    })

    return this.getPkceParams(authParams).then(maybeChallenge => {

      const params = {
        ...authParams,
        ...maybeChallenge,
      }

      const authorizationUrl = this.getAuthorizationUrl(params)

      return this.getWebMessage(
        authorizationUrl,
        `https://${this.config.domain}`,
        opts.redirectUri,
      )
    })
  }

  private getWebMessage(
    src: string,
    origin: string,
    redirectUri?: string,
  ): Promise<AuthResult> {
    const iframe = document.createElement('iframe')
    // "wm" needed to make sure the randomized id is valid
    const id = `wm${randomBase64String()}`
    iframe.setAttribute('width', '0')
    iframe.setAttribute('height', '0')
    iframe.setAttribute('style', 'display:none;')
    iframe.setAttribute('id', id)
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

        const result = data.response

        if (AuthResult.isAuthResult(result)) {
          if (result.code) {
            resolve(this.exchangeAuthorizationCodeWithPkce({
              code: result.code,
              redirectUri: redirectUri || window.location.origin,
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
    window.location.assign(`https://${this.config.domain}/identity/v1/logout?${toQueryString(opts)}`)
  }

  private loginWithRedirect(queryString: Record<string, string | boolean | undefined>): Promise<void> {
    return redirect(this.getAuthorizationUrl(queryString))
  }

  private getAuthorizationUrl(queryString: Record<string, string | boolean | undefined>): string {
    return `${this.authorizeUrl}?${toQueryString(queryString)}`
  }

  private loginWithCordovaInAppBrowser(opts: QueryString): Promise<void | InAppBrowser> {
    return this.openInCordovaSystemBrowser(
      this.getAuthorizationUrl({
        ...opts,
        display: 'page'
      })
    )
  }

  private openInCordovaSystemBrowser(url: string): Promise<void | InAppBrowser> {
    return this.getAvailableBrowserTabPlugin().then(maybeBrowserTab => {
      if (!window.cordova) {
        return Promise.reject(new Error('Cordova environnement not detected.'))
      }

      if (maybeBrowserTab) {
        maybeBrowserTab.openUrl(url, () => {}, logError)
        return Promise.resolve()
      }

      if (window.cordova.InAppBrowser) {
        const ref = window.cordova.platformId === 'ios' ?
          // Open a webview (to pass Apple validation tests)
          window.cordova.InAppBrowser.open(url, '_blank') :
          // Open the system browser
          window.cordova.InAppBrowser.open(url, '_system')
        return Promise.resolve(ref)
      }

      return Promise.reject(new Error('Cordova plugin "InAppBrowser" is required.'))
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

  private loginWithPopup(opts: AuthOptions & { provider: string }): Promise<void> {
    type WinChanResponse<D> = { success: true; data: D } | { success: false; data: ErrorResponse }
    const { responseType, redirectUri, provider } = opts

    WinChan.open(
      {
        url: `${this.authorizeUrl}?${toQueryString(opts)}`,
        relay_url: this.popupRelayUrl,
        window_features: computeProviderPopupOptions(provider)
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
          if (responseType === 'code') {
            window.location.assign(`${redirectUri}?code=${r.data.code}`)
          } else {
            this.eventManager.fireEvent('authenticated', r.data)
          }
        } else {
          this.eventManager.fireEvent('authentication_failed', r.data)
        }
      }
    )
    return Promise.resolve()
  }

  loginWithPassword(params: LoginWithPasswordParams): Promise<AuthResult> {
    const { auth = {}, ...rest } = params

    const loginPromise =
      window.cordova
        ? this.ropcPasswordLogin(params)
          .then(authResult =>
            this.storeCredentialsInBrowser(params).then(() => enrichAuthResult(authResult))
          )
        : this.http
            .post<AuthenticationToken>('/password/login', {
              body: {
                clientId: this.config.clientId,
                scope: this.resolveScope(auth),
                ...rest
              }
            })
            .then(tkn => this.storeCredentialsInBrowser(params).then(() => tkn))
            .then(tkn => this.loginCallback(tkn, auth))

    return loginPromise.catch((err: any) => {
      if (err.error) {
        this.eventManager.fireEvent('login_failed', err)
      }
      return Promise.reject(err)
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

  private ropcPasswordLogin(params: LoginWithPasswordParams): Promise<AuthResult> {
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
      .then(authResult => {
        this.eventManager.fireEvent('authenticated', authResult)
        return enrichAuthResult(authResult)
      })
  }

  private loginCallback(tkn: AuthenticationToken, auth: AuthOptions = {}): Promise<AuthResult> {
    const authParams = this.authParams(auth)

    return this.getPkceParams(authParams).then(maybeChallenge => {
      const queryString = toQueryString({
        ...authParams,
        ...maybeChallenge,
        ...pick(tkn, 'tkn')
      })

      if (auth.useWebMessage) {
        return this.getWebMessage(
          `${this.authorizeUrl}?${queryString}`,
          `https://${this.config.domain}`,
          auth.redirectUri,
        )
      } else {
        return redirect(`${this.authorizeUrl}?${queryString}`) as AuthResult
      }
    })
  }

  // TODO: Make passwordless able to handle web_message
  // Asana https://app.asana.com/0/982150578058310/1200173806808689/f
  startPasswordless(params: SingleFactorPasswordlessParams, auth: Omit<AuthOptions, 'useWebMessage'> = {}): Promise<PasswordlessResponse> {
    const passwordlessPayload =
      ('stepUp' in params)
        ? Promise.resolve(params)
        : this.resolveSingleFactorPasswordlessParams(params, auth)

    return passwordlessPayload.then(payload =>
      this.http.post<PasswordlessResponse>('/passwordless/start', {
        body: payload
      })
    )
  }

  private resolveSingleFactorPasswordlessParams(params: SingleFactorPasswordlessParams, auth: Omit<AuthOptions, 'useWebMessage'> = {}): Promise<{}> {
    const { authType, email, phoneNumber, captchaToken } = params
    const authParams = this.authParams(auth)

    return this.getPkceParams(authParams).then(maybeChallenge => {
      return {
        ...authParams,
        authType,
        email,
        phoneNumber,
        captchaToken,
        ...maybeChallenge,
      }
    })
  }

  private loginWithVerificationCode(params: VerifyPasswordlessParams, auth: AuthOptions = {}): void {
    const queryString = toQueryString({
      ...this.authParams(auth),
      ...params
    })
    window.location.assign(`https://${this.config.domain}/identity/v1/passwordless/verify?${queryString}`)
  }

  verifyPasswordless(params: VerifyPasswordlessParams, auth: AuthOptions = {}): Promise<void> {
   return ('challengeId' in params)
      ? Promise.resolve(this.loginWithVerificationCode(params))
      : this.http
        .post('/verify-auth-code', { body: params })
        .catch(err => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)
          return Promise.reject(err)
        })
        .then(() => this.loginWithVerificationCode(params, auth))
  }

  signup(params: SignupParams): Promise<AuthResult> {
    const { data, auth, redirectUrl, returnToAfterEmailConfirmation, saveCredentials, captchaToken } = params
    const { clientId } = this.config
    const scope = this.resolveScope(auth)

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
          .post<AuthResult>(`/signup-token`, {
            body: {
              clientId,
              redirectUrl,
              scope,
              ...pick(auth, 'origin'),
              data,
              returnToAfterEmailConfirmation,
              captchaToken
            }
          })
          .then(authResult => {
            this.eventManager.fireEvent('authenticated', authResult)
            return this.storeCredentialsInBrowser(loginParams).then(() => enrichAuthResult(authResult))
          })
      : this.http
          .post<AuthenticationToken>('/signup', {
            body: {
              clientId,
              redirectUrl,
              scope,
              data,
              returnToAfterEmailConfirmation,
              captchaToken
            }
          })
          .then(tkn => this.storeCredentialsInBrowser(loginParams).then(() => tkn))
          .then(tkn => this.loginCallback(tkn, auth))

    return resultPromise.catch(err => {
      if (err.error) {
        this.eventManager.fireEvent('signup_failed', err)
      }
      return Promise.reject(err)
    })
  }

  refreshTokens(params: RefreshTokenParams): Promise<AuthResult> {
    const result =
      ('refreshToken' in params)
        ? this.http.post<AuthResult>(this.tokenUrl, {
          body: {
            clientId: this.config.clientId,
            grantType: 'refresh_token',
            refreshToken: params.refreshToken,
            ...pick(params, 'scope'),
          }
        })
        : this.http.post<AuthResult>('/token/access-token', {
          body: {
            clientId: this.config.clientId,
            accessToken: params.accessToken
          }
        })

    return result.then(enrichAuthResult)
  }

  loginWithCustomToken({ token, auth }: { token: string; auth: AuthOptions }): void {
    const queryString = toQueryString({
      ...this.authParams(auth),
      token
    })
    // Non existent endpoint URL
    window.location.assign(`https://${this.config.domain}/identity/v1/custom-token/login?${queryString}`)
  }

  loginWithCredentials(params: LoginWithCredentialsParams): Promise<AuthResult> {
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

  getSessionInfo(): Promise<SessionInfo> {
    return this.http.get<SessionInfo>('/sso/data', {
      query: { clientId: this.config.clientId },
      withCookies: true
    })
  }

  private getPkceParams(authParams: AuthParameters): Promise<PkceParams | {}> {
    if (this.config.isPublic && authParams.responseType === 'code')
      return computePkceParams()
    else if (authParams.responseType === 'token' && this.config.pkceEnforced)
      return Promise.reject(new Error('Cannot use implicit flow when PKCE is enforced'))
    else
      return Promise.resolve({})
  }

  private resolveScope(opts: AuthOptions = {}) {
    return resolveScope(opts, this.config.scope)
  }

  private authParams(opts: AuthOptions, { acceptPopupMode = false } = {}) {
    const isConfidentialCodeWebMsg = !this.config.isPublic && !!opts.useWebMessage && (opts.responseType === 'code' || opts.redirectUri)

    const overrideResponseType: Partial<AuthOptions> = isConfidentialCodeWebMsg
      ? { responseType: 'token', redirectUri: undefined }
      : {}

    return {
      clientId: this.config.clientId,
      ...computeAuthOptions(
        {
          ...opts,
          ...overrideResponseType
        },
        { acceptPopupMode },
        this.config.scope
      )
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
