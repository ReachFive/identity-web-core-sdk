import WinChan from 'winchan'
import pick from 'lodash/pick'

import { logError } from '../utils/logger'
import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties } from '../utils/transformObjectProperties'

import { ErrorResponse, Profile, SessionInfo } from './models'
import { AuthOptions, prepareAuthOptions, resolveScope } from './authOptions'
import { AuthResult, enrichAuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { UrlParser } from './urlParser'
import { popupSize } from './providerPopupSize'
import { createHttpClient, HttpClient } from './httpClient'
import {computePkceParams, TokenRequestParameters} from "./pkceService";

export type SignupParams = { data: Profile; auth?: AuthOptions }

type EmailLoginWithPasswordParams = { email: string; password: string; auth?: AuthOptions }
type PhoneNumberLoginWithPasswordParams = { phoneNumber: string; password: string; auth?: AuthOptions }

export type LoginWithPasswordParams = EmailLoginWithPasswordParams | PhoneNumberLoginWithPasswordParams

type EmailRequestPasswordResetParams = { email: string, redirectUrl?: string }
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
  AccessTokenUpdatePasswordParams | EmailVerificationCodeUpdatePasswordParams | SmsVerificationCodeUpdatePasswordParams

export type PasswordlessParams = { authType: 'magic_link' | 'sms'; email?: string; phoneNumber?: string }

export type ApiClientConfig = {
  clientId: string
  domain: string
  language?: string
  sso: boolean
  pkceEnabled?: boolean
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
  private verifierKey: string = 'verifier_key'

  loginWithSocialProvider(provider: string, opts: AuthOptions = {}): Promise<void> {
    const authParams = this.authParams(opts, { acceptPopupMode: true })

    if (this.config.pkceEnabled && authParams.responseType === 'token') {
      throw new Error('Cannot use implicit flow when PKCE is enabled')
    }

    return computePkceParams(this.config.pkceEnabled, this.verifierKey).then(maybeChallenge => {
      const params = {
        ...authParams,
        provider,
        ...maybeChallenge
      }
      if ('cordova' in window) {
        return this.loginWithCordovaInAppBrowser(params)
      }
      else if (params.display === 'popup') {
        return this.loginWithPopup(params)
      }
      else {
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
            code: params.code,
            redirectUri: params.redirectUri,
            code_verifier: sessionStorage.getItem(this.verifierKey)
          }
        }).then(result => this.eventManager.fireEvent('authenticated', result))
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

  logout(opts: { redirectTo?: string } = {}): void {
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
        window.cordova.InAppBrowser.open(url, '_system')
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
    const resultPromise = window.cordova
      ? this.loginWithPasswordByOAuth(params)
      : this.loginWithPasswordByRedirect(params)

    return resultPromise.catch((err: any) => {
      if (err.error) {
        this.eventManager.fireEvent('login_failed', err)
      }
      throw err
    })
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
          scope: resolveScope(auth),
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
          ...rest
        }
      })
      .then(({ tkn }) => this.loginWithPasswordToken(tkn, auth))
  }

  private loginWithPasswordToken(tkn: string, auth: AuthOptions = {}): void {
    const authParams = this.authParams(auth)

    const queryString = toQueryString({
      ...authParams,
      tkn
    })
    window.location.assign(`${this.baseUrl}/password/callback?${queryString}`)
  }

  startPasswordless(params: PasswordlessParams, opts: AuthOptions = {}): Promise<void> {
    const { authType, email, phoneNumber } = params

    return this.http.post('/passwordless/start', {
      body: {
        ...this.authParams(opts),
        authType,
        email,
        phoneNumber
      }
    })
  }

  private loginWithVerificationCode(params: PasswordlessParams, auth: AuthOptions): void {
    const queryString = toQueryString({
      ...this.authParams(auth),
      ...params
    })
    window.location.assign(`${this.baseUrl}/passwordless/verify?${queryString}`)
  }

  verifyPasswordless(params: PasswordlessParams, auth = {}): Promise<void> {
    return this.http
      .post('/verify-auth-code', { body: params })
      .then(() => this.loginWithVerificationCode(params, auth))
      .catch(err => {
        if (err.error) this.eventManager.fireEvent('login_failed', err)
        throw err
      })
  }

  signup(params: SignupParams): Promise<void> {
    const { data, auth } = params
    const acceptTos = auth && auth.acceptTos

    const result = window.cordova
      ? this.http
          .post<AuthResult>(`${this.baseUrl}/signup-token`, {
            body: {
              clientId: this.config.clientId,
              scope: resolveScope(auth),
              ...pick(auth, 'origin'),
              data
            }
          })
          .then(result => this.eventManager.fireEvent('authenticated', result))
      : this.http
          .post<{ tkn: string }>('/signup', {
            body: {
              clientId: this.config.clientId,
              acceptTos,
              data
            }
          })
          .then(({ tkn }) => this.loginWithPasswordToken(tkn, auth))

    return result.catch(err => {
      if (err.error) {
        this.eventManager.fireEvent('signup_failed', err)
      }
      throw err
    })
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

  updateEmail(params: { accessToken: string, email: string, redirectUrl?: string }): Promise<void> {
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

  updateProfile({ accessToken, data }: { accessToken: string; data: Profile }): Promise<void> {
    return this.http
      .post('/update-profile', { body: data, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', data))
  }

  loginWithCustomToken({ token, auth }: { token: string; auth: AuthOptions }): void {
    const queryString = toQueryString({
      ...this.authParams(auth),
      token
    })
    window.location.assign(`${this.baseUrl}/custom-token/login?${queryString}`)
  }

  getSessionInfo(): Promise<SessionInfo> {
    return this.http.get<SessionInfo>('/sso/data', {
      query: { clientId: this.config.clientId },
      withCookies: true
    })
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

  private authParams(opts: AuthOptions, { acceptPopupMode = false } = {}) {
    return {
      clientId: this.config.clientId,
      ...prepareAuthOptions(opts, { acceptPopupMode })
    }
  }
}

function hasLoggedWithEmail(params: LoginWithPasswordParams): params is EmailLoginWithPasswordParams {
  return (params as EmailLoginWithPasswordParams).email !== undefined
}
