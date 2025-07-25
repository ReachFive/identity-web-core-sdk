import WinChan from 'winchan'
import { logError } from '../utils/logger'
import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties } from '../utils/transformObjectProperties'
import { difference, pick } from '../utils/utils'
import {
  ErrorResponse,
  SessionInfo,
  SignupProfile,
  PasswordlessResponse,
  Scope,
  AuthenticationToken, OrchestrationToken,
  PasswordStrength,
} from './models'
import { AuthOptions, computeAuthOptions } from './authOptions'
import { AuthResult, enrichAuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { popupSize } from './providerPopupSize'
import { HttpClient } from './httpClient'
import { computePkceParams, PkceParams } from './pkceService'
import { randomBase64String } from '../utils/random'
import { ApiClientConfig } from './main'
import { AuthParameters } from './authParameters'
import { resolveScope } from './scopeHelper'
import * as OneTap from "google-one-tap"
import { encodeToBase64 } from "../utils/base64"
import { Buffer } from 'buffer/'
import MfaClient from './mfaClient'
import { getWithExpiry, setWithExpiry } from '../utils/sessionStorage'
import { CaptchaProvider } from './captcha'

export type LoginWithCredentialsParams = {
  mediation?: 'silent' | 'optional' | 'required'
  auth?: AuthOptions
}

export type LoginWithCustomTokenParams = {
  token: string
  auth: AuthOptions
}

type LoginWithPasswordOptions = { password: string; saveCredentials?: boolean; auth?: AuthOptions, captchaToken?: string, action?: string }
type EmailLoginWithPasswordParams = LoginWithPasswordOptions & { email: string }
type PhoneNumberLoginWithPasswordParams = LoginWithPasswordOptions & { phoneNumber: string }
type CustomIdentifierLoginWithPasswordParams = LoginWithPasswordOptions & { customIdentifier: string }
export type LoginWithPasswordParams = EmailLoginWithPasswordParams | PhoneNumberLoginWithPasswordParams | CustomIdentifierLoginWithPasswordParams

export type LogoutParams = {
  redirectTo?: string
  removeCredentials?: boolean
}

export type RevocationParams = {
  tokens: string[]
}

export type RefreshTokenParams = { refreshToken: string, scope?: Scope }

export type SingleFactorPasswordlessParams = {
  authType: 'magic_link' | 'sms'
  email?: string
  phoneNumber?: string
  captchaToken?: string
  captchaProvider?: CaptchaProvider;
}

export type StepUpPasswordlessParams = {
  authType: 'email' | 'sms'
  stepUp: string
}

export type PasswordlessParams = SingleFactorPasswordlessParams | StepUpPasswordlessParams

export type SignupParams = {
  data: SignupProfile
  returnToAfterEmailConfirmation?: string
  saveCredentials?: boolean
  auth?: AuthOptions
  redirectUrl?: string
  captchaToken?: string
  captchaProvider?: CaptchaProvider
}

export type TokenRequestParameters = {
  code: string
  redirectUri: string
  persistent?: boolean // Whether the remember me is enabled
  returnProviderToken?: boolean
}

export type VerifyPasswordlessParams = {
  authType: 'magic_link' | 'sms'
  email?: string
  phoneNumber?: string
  verificationCode: string
}

/**
 * Identity Rest API Client
 */
export default class OAuthClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager
  private mfaClient: MfaClient | undefined

  private authorizeUrl: string
  private customTokenUrl: string
  private logoutUrl: string
  private revokeUrl: string
  private passwordlessVerifyUrl: string
  private passwordStrengthUrl: string
  private popupRelayUrl: string
  private tokenUrl: string

  private passwordLoginUrl: string
  private passwordlessStartUrl: string
  private passwordlessVerifyAuthCodeUrl: string
  private sessionInfoUrl: string
  private signupUrl: string
  private signupTokenUrl: string

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager

    this.authorizeUrl = `${this.config.baseUrl}/oauth/authorize`
    this.customTokenUrl = `${this.config.baseUrl}/identity/v1/custom-token/login`
    this.logoutUrl = `${this.config.baseUrl}/identity/v1/logout`
    this.revokeUrl = `${this.config.baseUrl}/oauth/revoke`
    this.passwordlessVerifyUrl = `${this.config.baseUrl}/identity/v1/passwordless/verify`
    this.passwordStrengthUrl = `${this.config.baseUrl}/identity/v1/password/strength`
    this.popupRelayUrl = `${this.config.baseUrl}/popup/relay`
    this.tokenUrl = `${this.config.baseUrl}/oauth/token`

    this.passwordlessVerifyAuthCodeUrl = '/verify-auth-code'
    this.passwordLoginUrl = '/password/login'
    this.passwordlessStartUrl = '/passwordless/start'
    this.sessionInfoUrl = '/sso/data'
    this.signupUrl = '/signup'
    this.signupTokenUrl = '/signup-token'
  }

  setMfaClient(mfaClient: MfaClient): void {
    this.mfaClient = mfaClient
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

    if (this.isAuthorizationLocked() || this.isSessionLocked())
      return Promise.reject(new Error('An ongoing authorization flow has not yet completed.'))

    this.acquireSessionLock()

    return this.getPkceParams(authParams).then((maybeChallenge) => {
      const params = {
        ...authParams,
        ...maybeChallenge,
      }

      const authorizationUrl = this.getAuthorizationUrl(params)

      return this.getWebMessage(
          authorizationUrl,
          this.config.baseUrl,
          opts.redirectUri,
      )
    })
  }

  exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters): Promise<AuthResult> {
    return this.http
        .post<AuthResult>(this.tokenUrl, {
          body: {
            clientId: this.config.clientId,
            grantType: 'authorization_code',
            codeVerifier: localStorage.getItem('verifier_key'),
            ...params
          }
        })
        .then(authResult => {
          this.eventManager.fireEvent('authenticated', authResult)
          return enrichAuthResult(authResult)
        })
      .finally(() => {
        this.releaseAuthorizationLock()
        this.releaseSessionLock()
      })
  }

  getPasswordStrength(password: string): Promise<PasswordStrength> {
    return this.http.post<PasswordStrength>(this.passwordStrengthUrl, {
      body: {
        clientId: this.config.clientId,
        password,
      }
    })
  }

  getSessionInfo(): Promise<SessionInfo> {
    return this.http.get<SessionInfo>(this.sessionInfoUrl, {
      query: { clientId: this.config.clientId },
    })
  }

  loginFromSession(opts: AuthOptions = {}): Promise<void> {
    if (!this.config.sso)
      return Promise.reject(
          new Error("Cannot call 'loginFromSession' if SSO is not enabled.")
      )
    if (this.isAuthorizationLocked() || this.isSessionLocked())
      return Promise.reject(new Error('An ongoing authorization flow has not yet completed.'))

    this.acquireSessionLock()

    const authParams = this.authParams({
      ...opts,
      useWebMessage: false,
    })

    return this.getPkceParams(authParams).then(maybeChallenge => {
      const params = {
        ...authParams,
        ...maybeChallenge,
      }

      return this.redirectThruAuthorization(params)
    })
  }

  isPasswordCredential(credentials: Awaited<ReturnType<typeof navigator.credentials.get>>): credentials is PasswordCredential {
    return (credentials as PasswordCredential).type === 'password'
  }

  loginWithCredentials(params: LoginWithCredentialsParams): Promise<AuthResult> {
    if (navigator.credentials && navigator.credentials.get) {
      const request: CredentialRequestOptions = {
        password: true,
        mediation: params.mediation || 'silent'
      }
      return navigator.credentials.get(request).then(credentials => {
        if (credentials && this.isPasswordCredential(credentials)) {
          const loginParams: EmailLoginWithPasswordParams = {
            email: credentials.id,
            password: credentials.password || '',
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

  loginWithCustomToken(params: LoginWithCustomTokenParams): void {
    const { token, auth } = params
    const queryString = toQueryString({
      ...this.authParams(auth),
      token

    })
    // Non existent endpoint URL
    window.location.assign(`${this.customTokenUrl}?${queryString}`)
  }

  loginWithPassword(params: LoginWithPasswordParams): Promise<AuthResult> {
    const { auth = {}, ...rest } = params

    this.acquireAuthorizationLock()

    const loginPromise =
        window.cordova
            ? this.ropcPasswordLogin(params)
                .then(authResult =>
                    this.storeCredentialsInBrowser(params).then(() => enrichAuthResult(authResult))
                )
            : this.http
                .post<AuthenticationToken>(this.passwordLoginUrl, {
                  body: {
                    clientId: this.config.clientId,
                    scope: resolveScope(auth, this.config.scope),
                    ...rest
                  },
                })
                .then(tkn => this.storeCredentialsInBrowser(params).then(() => tkn))
            .then(authenticationToken => {
              if (authenticationToken.mfaRequired) {
                return this.mfaClient ?
                  this.mfaClient?.getMfaStepUpToken({tkn: authenticationToken.tkn, options: auth, action: params.action})
                    .then(res => ({stepUpToken: res.token, amr: res.amr}))
                  : Promise.reject(new Error("Error during client instantiation"))
              }
              return this.loginCallback(authenticationToken, auth)
            })

    return loginPromise.catch((err: ErrorResponse) => {
      if (err.error) {
        this.eventManager.fireEvent('login_failed', err)
      }
      return Promise.reject(err)
    })
  }

  loginWithSocialProvider(provider: string, opts: AuthOptions = {}): Promise<void | InAppBrowser> {
    if (this.config.orchestrationToken) {
      const params = {
        ...(this.orchestratedFlowParams(this.config.orchestrationToken, {
          ...opts,
          useWebMessage: false,
        })),
        provider,
      }

      if ('cordova' in window) {
        return this.loginWithCordovaInAppBrowser(params)
      } else if (params.display === 'popup') {
        return this.loginWithPopup(params)
      } else {
        return this.redirectThruAuthorization(params)
      }
    } else {
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
          return this.redirectThruAuthorization(params)
        }
      })
    }
  }

  private loginWithIdToken(provider: string, idToken: string, nonce: string, opts: AuthOptions = {}): Promise<void> {
    const authParams = this.authParams({
      ...opts,
    })

    if(opts.useWebMessage) {
      const queryString = toQueryString({
        ...authParams,
        provider,
        idToken,
        nonce,
      })

      return this.getWebMessage(
        `${this.authorizeUrl}?${queryString}`,
        this.config.baseUrl,
        opts.redirectUri,
      ).then()
    } else {
      return this.redirectThruAuthorization({
        ...authParams,
        provider,
        idToken,
        nonce,
      })
    }
  }

  private googleOneTap(opts: AuthOptions = {}, nonce: string = randomBase64String()): Promise<void> {
      const binaryNonce = Buffer.from(nonce, 'utf-8')

      return window.crypto.subtle.digest('SHA-256', binaryNonce).then(hash => {
        const googleIdConfiguration: OneTap.IdConfiguration = {
          client_id: this.config.googleClientId,
          callback: (response: OneTap.CredentialResponse) => this.loginWithIdToken("google", response.credential, nonce, opts),
          nonce: encodeToBase64(hash),
          // Enable auto sign-in
          auto_select: true,
        }

        window.google.accounts.id.initialize(googleIdConfiguration)

        // Activate Google One Tap
        window.google.accounts.id.prompt()

      })
  }

  instantiateOneTap(opts: AuthOptions = {}): void {
    if (this.config?.googleClientId) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.onload = () => this.googleOneTap(opts)
      script.async = true
      script.defer = true
      document.querySelector("body")?.appendChild(script)
    } else {
      logError('Google configuration missing.')
    }
  }

  logout(opts: LogoutParams = {}, revocationParams?: RevocationParams): Promise<void> {
    if (navigator.credentials && navigator.credentials.preventSilentAccess && opts.removeCredentials === true) {
      navigator.credentials.preventSilentAccess()
    }
    if (this.config.isPublic && revocationParams) {
      return this.revokeToken(revocationParams)
          .then(() => window.location.assign(`${this.logoutUrl}?${toQueryString(opts)}`))
    } else {
      return Promise.resolve(window.location.assign(`${this.logoutUrl}?${toQueryString(opts)}`))
    }
  }

  private revokeToken(revocationParams: RevocationParams): Promise<void[]> {
    const revocationsCalls = revocationParams.tokens.map(token => this.http.post<void>(this.revokeUrl, {
      body: {
        clientId: this.config.clientId,
        token
      }
    }))

   return Promise.all(revocationsCalls)
  }

  refreshTokens(params: RefreshTokenParams): Promise<AuthResult> {
    const result =
      this.http.post<AuthResult>(this.tokenUrl, {
        body: {
          clientId: this.config.clientId,
          grantType: 'refresh_token',
          refreshToken: params.refreshToken,
          ...pick(params, 'scope'),
        }
      })

    return result.then(enrichAuthResult)
  }

  signup(params: SignupParams): Promise<AuthResult> {
    const { data, auth, redirectUrl, returnToAfterEmailConfirmation, saveCredentials, captchaToken, captchaProvider } = params
    const { clientId } = this.config
    const scope = resolveScope(auth, this.config.scope)

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
            .post<AuthResult>(this.signupTokenUrl, {
              body: {
                clientId,
                redirectUrl,
                scope,
                ...pick(auth, 'origin'),
                data,
                returnToAfterEmailConfirmation,
                captchaToken,
                captchaProvider
              }
            })
            .then(authResult => {
              this.eventManager.fireEvent('authenticated', authResult)
              return this.storeCredentialsInBrowser(loginParams).then(() => enrichAuthResult(authResult))
            })
        : this.http
            .post<AuthenticationToken>(this.signupUrl, {
              body: {
                clientId,
                redirectUrl,
                scope,
                data,
                returnToAfterEmailConfirmation,
                captchaToken,
                captchaProvider
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

  startPasswordless(params: PasswordlessParams, auth: Omit<AuthOptions, 'useWebMessage'> = {}): Promise<PasswordlessResponse> {
    const passwordlessPayload =
        ('stepUp' in params)
            ? this.resolveSecondFactorPasswordlessParams(params)
            : this.resolveSingleFactorPasswordlessParams(params, auth)

    return passwordlessPayload.then(payload =>
        this.http.post<PasswordlessResponse>(this.passwordlessStartUrl, {
          body: payload
        })
    )
  }

  verifyPasswordless(params: VerifyPasswordlessParams, auth: AuthOptions = {}): Promise<AuthResult | void> {
    return ('challengeId' in params)
        ? Promise.resolve(this.loginWithVerificationCode(params, auth))
        : this.http
            .post(this.passwordlessVerifyAuthCodeUrl, { body: params })
            .catch(err => {
              if (err.error) this.eventManager.fireEvent('login_failed', err)
              return Promise.reject(err)
            })
            .then(() => this.loginWithVerificationCode(params, auth))
  }

  private getAuthorizationUrl(queryString: Record<string, string | boolean | undefined>): string {
    return `${this.authorizeUrl}?${toQueryString(queryString)}`
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
        const data = camelCaseProperties(event.data) as { type: string, response: AuthResult }
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
      .finally(() => {
        this.releaseAuthorizationLock()
        this.releaseSessionLock()
      }
    )
  }

  private loginWithPopup(opts: AuthOptions & { provider: string }): Promise<void> {
    type WinChanResponse<D> = { success: true; data: D } | { success: false; data: ErrorResponse }
    const { responseType, redirectUri, provider } = opts

    return new Promise((resolve, reject) => {
      WinChan.open<WinChanResponse<object>>(
        {
          url: `${this.authorizeUrl}?${toQueryString(opts)}`,
          relay_url: this.popupRelayUrl,
          window_features: this.computeProviderPopupOptions(provider)
        },
        (err, result) => {
          if (err) {
            logError(err)
            this.eventManager.fireEvent('authentication_failed', {
              errorDescription: 'Unexpected error occurred',
              error: 'server_error'
            })
            return reject(err)
          }

          if (result) {
            const r = camelCaseProperties(result) as WinChanResponse<AuthResult>

            if (r.success) {
              resolve()
              if (responseType === 'code') {
                window.location.assign(`${redirectUri}?code=${r.data.code}`)
              } else {
                this.eventManager.fireEvent('authenticated', r.data)
              }
            } else {
              this.eventManager.fireEvent('authentication_failed', r.data)
              return reject(r.data)
            }
          }
        }
      )
    })
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

  private redirectThruAuthorization(queryString: Record<string, string | boolean | undefined>): Promise<void> {
    const location = this.getAuthorizationUrl(queryString)
    this.releaseAuthorizationLock()
    this.releaseSessionLock()
    window.location.assign(location)
    return Promise.resolve()
  }

  private loginWithVerificationCode(params: VerifyPasswordlessParams, auth: AuthOptions = {}): Promise<AuthResult | void> {
    const queryString = toQueryString({
      ...this.authParams(auth),
      ...params
    })
    if(auth.useWebMessage) {
      return this.http
        .post<AuthResult>(this.passwordlessVerifyUrl, { body: params })
        .catch(err => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)
          return Promise.reject(err)
        })
        .then((result: AuthResult) => {
          if (AuthResult.isAuthResult(result)) {
            if (result.code) {
              return this.exchangeAuthorizationCodeWithPkce({
                code: result.code,
                redirectUri: auth.redirectUri || window.location.origin,
              })
            } else {
              this.eventManager.fireEvent('authenticated', result)
              return Promise.resolve(enrichAuthResult(result))
            }
          } else if (ErrorResponse.isErrorResponse(result)) {
            // The 'authentication_failed' event must not be triggered because it is not a real authentication failure.
            return Promise.reject(result)
          } else {
            return Promise.reject({
              error: 'unexpected_error',
              errorDescription: 'Unexpected error occurred'
            })
          }
        })
    } else {
      window.location.assign(`${this.passwordlessVerifyUrl}?${queryString}`)
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
            username: this.getAuthenticationId(params),
            password: params.password,
            scope: resolveScope(auth, this.config.scope),
            ...pick(auth, 'origin')
          }
        })
        .then(authResult => {
          this.eventManager.fireEvent('authenticated', authResult)
          return enrichAuthResult(authResult)
        })
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

  private storeCredentialsInBrowser(params: LoginWithPasswordParams): Promise<void> {
    if (!params.saveCredentials) return Promise.resolve()

    if (navigator.credentials && navigator.credentials.create && navigator.credentials.store) {
      const credentialParams = {
        password: {
          password: params.password,
          id: this.getAuthenticationId(params)
        }
      } satisfies Parameters<typeof navigator.credentials.create>[0]

      return navigator.credentials
        .create(credentialParams)
        .then(credentials =>
          typeof credentials !== 'undefined' && credentials
            ? navigator.credentials.store(credentials).then(() => {})
            : Promise.resolve()
        )
    } else {
      logError('Unsupported Credentials Management API')
      return Promise.resolve()
    }
  }

  // TODO: Make passwordless able to handle web_message
  // Asana https://app.asana.com/0/982150578058310/1200173806808689/f
  private resolveSingleFactorPasswordlessParams(params: SingleFactorPasswordlessParams, auth: Omit<AuthOptions, 'useWebMessage'> = {}): Promise<object> {
    const { authType, email, phoneNumber, captchaToken, captchaProvider } = params

    if (this.config.orchestrationToken) {
      const authParams = this.orchestratedFlowParams(this.config.orchestrationToken, auth)

      return Promise.resolve({
        ...authParams,
        authType,
        email,
        phoneNumber,
        captchaToken,
        captchaProvider
      })
    } else {
      const authParams = this.authParams(auth)

      return this.getPkceParams(authParams).then(maybeChallenge => {
        return {
          ...authParams,
          authType,
          email,
          phoneNumber,
          captchaToken,
          captchaProvider,
          ...maybeChallenge,
        }
      })
    }
  }

  private resolveSecondFactorPasswordlessParams(params: StepUpPasswordlessParams): Promise<object> {
    const { authType, stepUp } = params
    if (this.config.orchestrationToken) {
      const authParams = this.orchestratedFlowParams(this.config.orchestrationToken)

      return Promise.resolve({
        ...authParams,
        authType,
        stepUp
      })
    } else {
      return Promise.resolve({
        authType,
        stepUp,
      })
    }
  }

  private hasLoggedWithEmail(params: LoginWithPasswordParams): params is EmailLoginWithPasswordParams {
    return (params as EmailLoginWithPasswordParams).email !== undefined
  }

  private hasLoggedWithPhoneNumber(params: LoginWithPasswordParams): params is PhoneNumberLoginWithPasswordParams {
    return (params as PhoneNumberLoginWithPasswordParams).phoneNumber !== undefined
  }

  private getAuthenticationId(params: LoginWithPasswordParams): string {
    if(this.hasLoggedWithEmail(params)) {
      return params.email
    } else if (this.hasLoggedWithPhoneNumber(params)) {
      return params.phoneNumber
    } else {
      return params.customIdentifier
    }
  }

  // TODO: Shared among the clients
  loginCallback(tkn: AuthenticationToken, auth: AuthOptions = {}): Promise<AuthResult> {
    if (this.config.orchestrationToken) {
      const authParams = {
        ...this.orchestratedFlowParams(this.config.orchestrationToken, auth),
        ...pick(tkn, 'tkn')
      }

      return Promise.resolve().then(() => this.redirectThruAuthorization(authParams) as AuthResult)
    } else {
      const authParams = this.authParams(auth)

      return this.getPkceParams(authParams).then(maybeChallenge => {
        const params = {
          ...authParams,
          ...maybeChallenge,
          ...pick(tkn, 'tkn')
        }

        if (auth.useWebMessage) {
          return this.getWebMessage(
            this.getAuthorizationUrl(params),
            this.config.baseUrl,
            auth.redirectUri)
        } else {
          return this.redirectThruAuthorization(params) as AuthResult
        }
      })
    }
  }

  // In an orchestrated flow, only parameters from the original request are to be considered,
  // as well as parameters that depend on user action
  private orchestratedFlowParams(orchestrationToken: OrchestrationToken, authOptions: AuthOptions = {}) {
    const authParams = computeAuthOptions(authOptions)

    const correctedAuthParams = {
      clientId: this.config.clientId,
      r5_request_token: orchestrationToken,
      ...pick(authParams, 'responseType', 'redirectUri', 'persistent', 'display'),
    }

    const uselessParams: string[] = difference(Object.keys(authParams), Object.keys(correctedAuthParams))
    if (uselessParams.length !== 0)
      console.debug("Orchestrated flow: pruned parameters: " + uselessParams)

    return correctedAuthParams
  }

  authParams(opts: AuthOptions, { acceptPopupMode = false } = {}) {
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

  getPkceParams(authParams: AuthParameters): Promise<PkceParams | object> {
    if (this.config.isPublic && authParams.responseType === 'code')
      return computePkceParams()
    else if (authParams.responseType === 'token' && this.config.pkceEnforced)
      return Promise.reject(new Error('Cannot use implicit flow when PKCE is enforced'))
    else
      return Promise.resolve({})
  }

  acquireAuthorizationLock(): void {
    setWithExpiry('authorize_state', 'state', 20000)
  }

  acquireSessionLock(): void {
    setWithExpiry('session_state', 'state', 20000)
  }

  releaseSessionLock(): void {
    sessionStorage.removeItem('session_state')
  }

  isSessionLocked(): boolean {
    return getWithExpiry('session_state') !== null
  }

  releaseAuthorizationLock(): void {
    sessionStorage.removeItem('authorize_state')
  }

  isAuthorizationLocked(): boolean {
    return getWithExpiry('authorize_state') !== null
  }
}
