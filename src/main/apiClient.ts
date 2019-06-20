import WinChan from 'winchan'
import isEmpty from 'lodash-es/isEmpty'
import pick from 'lodash-es/pick'

import { logError } from '../lib/logger'
import { parseQueryString, toQueryString, QueryString } from '../lib/queryString'
import EventManager from '../lib/eventManager'
import { camelCaseProperties, snakeCaseProperties } from '../lib/transformObjectProperties'
import { parseJwtTokenPayload } from '../lib/jwt'

import { ProviderId } from '../shared/providers/providers'
import providerSizes from '../shared/providers/provider-window-sizes'
import { Profile, ErrorResponse } from '../shared/model'
import { ApiClientConfig } from './apiClientConfig'
import {prepareAuthOptions, resolveScope, AuthOptions, TokenRequestParameters} from './authOptions'
import { AuthResult } from './authResult'
import { encodeToBase64 } from '../lib/base64';


export type Events = {
  'authenticated': AuthResult
  'profile_updated': Partial<Profile>
  'authentication_failed': ErrorResponse
  'login_failed': ErrorResponse
  'signup_failed': ErrorResponse
}

type RequestParams = {
  method?: 'GET' | 'POST'
  params?: QueryString
  body?: {}
  accessToken?: string
  withCookies?: boolean
}

export type SignupParams = { data: Profile, auth?: AuthOptions }

type EmailLoginWithPasswordParams = { email: string, password: string, auth?: AuthOptions }
type PhoneNumberLoginWithPasswordParams = { phoneNumber: string, password: string, auth?: AuthOptions }

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

export type PasswordlessParams = { authType: 'magic_link' | 'sms', email?: string, phoneNumber?: string }

type PkceParams = { codeChallenge?: string, codeChallengeMethod?: string }


export default class ApiClient {

  constructor(config: ApiClientConfig, eventManager: EventManager<Events>) {
    this.config = config
    this.eventManager = eventManager
    this.baseUrl = `https://${config.domain}/identity/v1`
    this.authorizeUrl = `https://${config.domain}/oauth/authorize`
    this.tokenUrl = `https://${config.domain}/oauth/token`
    this.popupRelayUrl = `https://${config.domain}/popup/relay`

    this.initCordovaCallbackIfNecessary()
  }

  private config: ApiClientConfig
  private eventManager: EventManager<Events>
  private baseUrl: string
  private authorizeUrl: string
  private tokenUrl: string
  private popupRelayUrl: string
  private verifierKey: string = 'verifier_key'
  private encoder = new TextEncoder();

  loginWithSocialProvider(provider: ProviderId, opts: AuthOptions = {}) {
    const authParams = this.authParams(opts, { acceptPopupMode: true })

    if(this.config.pkce && authParams.responseType === 'token' ) {
      throw new Error('Cannot use implicit flow when PKCE is enable')
    }

    this.handlePkce().then(maybeChallenge => {
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

  private handlePkce(): PromiseLike<PkceParams> {
    if (this.config.pkce) {
      return this.generateAndStorePkceChallenge()
          .then(challenge => {
            return {
              codeChallenge: challenge,
              codeChallengeMethod: 'S256'
            }
          })
    } else return Promise.resolve({})
  }

  private generateAndStorePkceChallenge() : PromiseLike<string> {
    const randomValues = window.crypto.getRandomValues(new Uint8Array(32))
    const verifier = encodeToBase64(randomValues)
    sessionStorage.setItem(this.verifierKey, verifier)
    const binaryChallenge = this.encoder.encode(verifier);

    const eventualDigest: PromiseLike<string> = window.crypto.subtle
        .digest('SHA-256', binaryChallenge)
        .then(hash => encodeToBase64(hash))
    return eventualDigest;
  }

  exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters) {
    return this.requestPost<AuthResult>(this.tokenUrl, {
      clientId: this.config.clientId,
      grantType: 'authorization_code',
      code: params.code,
      redirectUri: params.redirectUri,
      code_verifier: sessionStorage.getItem(this.verifierKey)
    }).then(result => this.fireAuthenticatedEvent(result))
  }

  loginFromSession(opts: AuthOptions = {}) {
    if (!this.config.sso && !opts.idTokenHint) {
      return Promise.reject(new Error("Cannot call 'loginFromSession' without 'idTokenHint' parameter if SSO is not enabled."))
    }
    return this.loginWithRedirect({
      ...this.authParams(opts),
      prompt: 'none'
    })
  }

  logout(opts: { redirect_to?: string }) {
    window.location.assign(`${this.baseUrl}/logout?${toQueryString(opts)}`)
  }

  parseUrlFragment(url: string): boolean {
    const authResult = this.checkFragment(url)

    if (AuthResult.isAuthResult(authResult)) {
      this.fireAuthenticatedEvent(authResult)
      return true
    }
    else if (ErrorResponse.isErrorResponse(authResult)) {
      this.fireEvent('authentication_failed', authResult)
      return true
    }
    return false
  }

  checkFragment(url: string = ''): AuthResult | ErrorResponse | undefined {
    const separatorIndex = url.indexOf('#')

    if (separatorIndex >= 0) {
      const parsed = parseQueryString(url.substr(separatorIndex + 1))

      const expiresIn = parsed.expiresIn
        ? parseInt(parsed.expiresIn)
        : undefined

      if (AuthResult.isAuthResult(parsed)) {
        return {
          ...parsed,
          expiresIn
        }
      }

      return ErrorResponse.isErrorResponse(parsed)
        ? parsed
        : undefined
    }

    return undefined
  }

  private loginWithRedirect(queryString: Record<string, string | boolean | undefined>) {
    window.location.assign(`${this.authorizeUrl}?${toQueryString(queryString)}`)
    return Promise.resolve()
  }

  private loginWithCordovaInAppBrowser(opts: QueryString) {
    const params = {
      ...opts,
      display: 'page'
    }
    return this.openInCordovaSystemBrowser(`${this.authorizeUrl}?${toQueryString(params)}`)
  }

  private openInCordovaSystemBrowser(url: string) {
    return this.getAvailableBrowserTabPlugin().then(maybeBrowserTab => {
      if (!window.cordova) return

      if (maybeBrowserTab) {
        maybeBrowserTab.openUrl(url, () => {}, logError)
      }
      else if (window.cordova.InAppBrowser) {
        window.cordova.InAppBrowser.open(url, '_system')
      }
      else {
        throw new Error('Cordova plugin "inappbrowser" is required.')
      }
    })
  }

  private getAvailableBrowserTabPlugin(): Promise<BrowserTab | undefined> {
    return new Promise((resolve, reject) => {
      const cordova = window.cordova

      if (!cordova || !cordova.plugins || !cordova.plugins.browsertab)
        return resolve(undefined)

      const plugin = cordova.plugins.browsertab

      plugin.isAvailable(
        isAvailable => resolve(isAvailable ? plugin : undefined),
        reject)
    })
  }

  private initCordovaCallbackIfNecessary() {
    if (!window.cordova) return
    if (window.handleOpenURL) return

    window.handleOpenURL = url => {
      const cordova = window.cordova
      if (!cordova) return

      const parsed = this.parseUrlFragment(url)

      if (parsed && cordova.plugins && cordova.plugins.browsertab) {
        cordova.plugins.browsertab.close()
      }
    }
  }

  private loginWithPopup(opts: AuthOptions & { provider: ProviderId }) {
    type WinChanResponse<D> = { success: true, data: D } | { success: false, data: ErrorResponse }

    WinChan.open({
      url: `${this.authorizeUrl}?${toQueryString(opts)}`,
      relay_url: this.popupRelayUrl,
      window_features: this.computeProviderPopupOptions(opts.provider)
    }, (err: string, result: WinChanResponse<object>) => {
      if (err) {
        logError(err)
        this.fireEvent('authentication_failed', {
          errorDescription: 'Unexpected error occurred',
          error: 'server_error'
        })
        return
      }

      const r = camelCaseProperties(result) as WinChanResponse<AuthResult>

      if (r.success) {
        this.authenticatedHandler(opts, r.data)
      } else {
        this.fireEvent('authentication_failed', r.data)
      }
    })
    return Promise.resolve()
  }

  loginWithPassword(params: LoginWithPasswordParams) {
    const resultPromise = window.cordova
      ? this.loginWithPasswordByOAuth(params)
      : this.loginWithPasswordByRedirect(params)

    return resultPromise.catch((err: any) => {
      if (err.error) {
        this.fireEvent('login_failed', err)
      }
      throw err
    })
  }

  private loginWithPasswordByOAuth(params: LoginWithPasswordParams) {
    const auth = params.auth

    return this.requestPost<AuthResult>(this.tokenUrl, {
      clientId: this.config.clientId,
      grantType: 'password',
      username: hasLoggedWithEmail(params) ? params.email : params.phoneNumber,
      password: params.password,
      scope: resolveScope(auth),
      ...(pick(auth, 'origin'))
    }).then(result => this.fireAuthenticatedEvent(result))
  }

  private loginWithPasswordByRedirect({ auth = {}, ...rest }: LoginWithPasswordParams) {
    return this.requestPost<{ tkn: string }>('/password/login', {
      clientId: this.config.clientId,
      ...rest
    }).then(
      ({ tkn }) => this.loginWithPasswordToken(tkn, auth)
    )
  }

  private loginWithPasswordToken(tkn: string, auth: AuthOptions = {}) {
    const authParams = this.authParams(auth)

    const queryString = toQueryString({
      ...authParams,
      tkn
    })
    window.location.assign(`${this.baseUrl}/password/callback?${queryString}`)
  }

  startPasswordless(params: PasswordlessParams, opts: AuthOptions = {}) {
    const { authType, email, phoneNumber } = params

    return this.requestPost('/passwordless/start', {
      ...this.authParams(opts),
      authType,
      email,
      phoneNumber
    })
  }

  private loginWithVerificationCode(params: PasswordlessParams, auth: AuthOptions) {
    const queryString = toQueryString({
      ...this.authParams(auth),
      ...params
    })
    window.location.assign(`${this.baseUrl}/passwordless/verify?${queryString}`)
  }

  verifyPasswordless(params: PasswordlessParams, auth = {}) {
    return this.requestPost('/verify-auth-code', params).then(_ =>
      this.loginWithVerificationCode(params, auth)
    ).catch(err => {
      if (err.error) this.fireEvent('login_failed', err)
      throw err
    })
  }

  signup(params: SignupParams) {
    const { data, auth } = params
    const acceptTos = auth && auth.acceptTos

    const result = window.cordova
      ? (
        this.requestPost<AuthResult>(`${this.baseUrl}/signup-token`, {
          clientId: this.config.clientId,
          scope: resolveScope(auth),
          ...(pick(auth, 'origin')),
          data
        }).then(result => this.fireAuthenticatedEvent(result))
      )
      : (
        this.requestPost<{ tkn: string }>('/signup', { clientId: this.config.clientId, acceptTos, data })
          .then(({ tkn }) => this.loginWithPasswordToken(tkn, auth))
      )

    return result.catch(err => {
      if (err.error) {
        this.fireEvent('signup_failed', err)
      }
      throw err
    })
  }

  requestPasswordReset(params: RequestPasswordResetParams) {
    return this.requestPost('/forgot-password', {
      clientId: this.config.clientId,
      ...params
    })
  }

  updatePassword(params: UpdatePasswordParams) {
    const { accessToken, ...data } = params
    return this.requestPost(
      '/update-password',
      { clientId: this.config.clientId, ...data },
      { accessToken }
    )
  }

  updateEmail(params: { accessToken: string, email: string, redirectUrl?: string }) {
    const { accessToken, ...data } = params
    return this.requestPost('/update-email', data, { accessToken })
  }

  updatePhoneNumber(params: { accessToken: string, phoneNumber: string }) {
    const { accessToken, ...data } = params
    return this.requestPost('/update-phone-number', data, { accessToken })
  }

  verifyPhoneNumber({ accessToken, ...data }: { accessToken: string, phoneNumber: string, verificationCode: string }) {
    const { phoneNumber } = data
    return this.requestPost('/verify-phone-number', data, { accessToken })
      .then(() =>
        this.fireEvent('profile_updated', { phoneNumber, phoneNumberVerified: true })
      )
  }

  unlink({ accessToken, ...data }: { accessToken: string, identityId: string, fields?: string }) {
    return this.requestPost('/unlink', data, { accessToken })
  }

  refreshTokens({ accessToken }: { accessToken: string }) {
    return this.request<AuthResult>('/token/access-token', {
      method: 'POST',
      body: {
        clientId: this.config.clientId,
        accessToken
      }
    }).then(this.enrichAuthResult)
  }

  getUser({ accessToken, ...params }: { accessToken: string, fields?: string }) {
    return this.requestGet('/me', params, { accessToken })
  }

  updateProfile({ accessToken, data }: { accessToken: string, data: Profile }) {
    return this.requestPost(
      '/update-profile',
      data,
      { accessToken }
    ).then(() => this.fireEvent('profile_updated', data))
  }

  loginWithCustomToken({ token, auth }: { token: string, auth: AuthOptions }) {
    const queryString = toQueryString({
      ...this.authParams(auth),
      token
    })
    window.location.assign(`${this.baseUrl}/custom-token/login?${queryString}`)
  }

  getSsoData(auth = {}) {
    const hints = pick(auth, ['idTokenHint', 'loginHint'])
    return this.requestGet(
      '/sso/data',
      { clientId: this.config.clientId, ...hints },
      { withCookies: true }
    )
  }

  checkSession(opts: AuthOptions = {}): Promise<AuthResult> {
    if (!this.config.sso && !opts.idTokenHint) {
      return Promise.reject(new Error("Cannot call 'loginFromSession' without 'idTokenHint' parameter if SSO is not enabled."))
    }
    const qs = toQueryString({
      ...this.authParams(opts),
      responseMode: 'web_message',
      prompt: 'none'
    })
    const authorizationUrl = `${this.authorizeUrl}?${qs}`

    const iframe = document.createElement('iframe')
    iframe.setAttribute('width', '0')
    iframe.setAttribute('height', '0')
    iframe.setAttribute('src', authorizationUrl)
    document.body.appendChild(iframe)

    return new Promise<AuthResult>((resolve, reject) => {
      // An error on timeout could be added, but the need is not obvious for this function.
      const listener = (event: MessageEvent) => {
        if (event.origin !== `https://${this.config.domain}`) return
        const data = camelCaseProperties(event.data) as any
        if (data.type === 'authorization_response') {
          if (AuthResult.isAuthResult(data.response)) {
            this.fireAuthenticatedEvent(data.response)
            resolve(this.enrichAuthResult(data.response))
          } else if (ErrorResponse.isErrorResponse(data.response)) {
            // The 'authentication_failed' event must not be triggered because it is not a real authentication failure.
            reject(data.response)
          } else {
            reject({
              error: 'unexpected_error',
              errorDescription: 'Unexpected error occurred',
            })
          }
          window.removeEventListener('message', listener)
        }
      }
      window.addEventListener('message', listener, false)
    })
  }

  on<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) {
    this.eventManager.on(eventName, listener)
  }

  off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) {
    this.eventManager.off(eventName, listener)
  }

  private authenticatedHandler = ({ responseType, redirectUri }: AuthOptions, response: AuthResult) => {
    if (responseType === 'code') {
      window.location.assign(`${redirectUri}?code=${response.code}`)
    } else {
      this.fireAuthenticatedEvent(response)
    }
  }

  private enrichAuthResult(response: AuthResult): AuthResult {
    if (response.idToken) {
      try {
        const idTokenPayload = parseJwtTokenPayload(response.idToken)
        return {
          ...response,
          idTokenPayload
        }
      } catch (e) {
        logError('id token parsing error: ' + e)
      }
    }
    return response
  }

  fireAuthenticatedEvent(data: AuthResult) {
    data = this.enrichAuthResult(data)
    this.eventManager.fire('authenticated', data)
  }

  fireEvent<K extends 'profile_updated' | 'authentication_failed' | 'login_failed' | 'signup_failed'>(eventName: K, data: Events[K]) {
    this.eventManager.fire(eventName, data)
  }

  private requestGet(path: string, params: {} = {}, options: Omit<RequestParams, 'params'>) {
    return this.request(path, { params, ...options })
  }

  private requestPost<Data>(path: string, body: {}, options = {}, params = {}) {
    return this.request<Data>(path, { method: 'POST', params, body, ...options })
  }

  private request<Data>(path: string, requestParams: RequestParams): Promise<Data> {
    const { method = 'GET', params = {}, body, accessToken = null, withCookies = false } = requestParams

    const fullPath = params && !isEmpty(params)
      ? `${path}?${toQueryString(params)}`
      : path

    const url = fullPath.startsWith('http') ? fullPath : this.baseUrl + fullPath

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...(accessToken && { 'Authorization': 'Bearer ' + accessToken }),
        ...(this.config.language && { 'Accept-Language': this.config.language }),
        ...(body && { 'Content-Type': 'application/json;charset=UTF-8' })
      },
      ...(withCookies && this.config.sso && { credentials: 'include' }),
      ...(body && { body: JSON.stringify(snakeCaseProperties(body)) })
    }

    return fetch(url, fetchOptions).then(response => {
      if (response.status != 204) {
        const dataP = response.json().then(camelCaseProperties) as any as Promise<Data>
        return response.ok ? dataP : dataP.then(data => Promise.reject(data))
      }
      return undefined as any as Data
    })
  }

  private computeProviderPopupOptions(provider: ProviderId) {
    try {
      const windowOptions = (provider && providerSizes[provider]) || {
        width: 400,
        height: 550
      }
      const left = Math.max(0, (screen.width - windowOptions.width) / 2)
      const top = Math.max(0, (screen.height - windowOptions.height) / 2)
      const width = Math.min(screen.width, windowOptions.width)
      const height = Math.min(screen.height, windowOptions.height)
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

function hasLoggedWithEmail (params: LoginWithPasswordParams): params is EmailLoginWithPasswordParams {
  return ((params as EmailLoginWithPasswordParams).email) !== undefined
}
