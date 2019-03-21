import { Profile, RemoteSettings, SessionInfo } from './models'
import ApiClient, { LoginWithPasswordParams, PasswordlessParams, SignupParams } from './apiClient'
import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import createEventManager, { Events } from './identityEventManager'
import createUrlParser from './urlParser'
import { toQueryString } from '../utils/queryString'
import { rawRequest } from './httpClient'

export { AuthResult } from './authResult'
export { AuthOptions } from './authOptions'
export { Profile, SessionInfo } from './models'

export interface Config {
  clientId: string,
  domain: string,
  language?: string
}

export type Client = {
  on: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  off: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  signup: (params: SignupParams) => Promise<void>
  loginWithPassword: (params: LoginWithPasswordParams) => Promise<void>
  startPasswordless: (params: PasswordlessParams, options?: AuthOptions) => Promise<void>
  verifyPasswordless: (params: PasswordlessParams) => Promise<void>
  loginWithSocialProvider: (provider: string, options?: AuthOptions) => Promise<void>
  requestPasswordReset: (params: { email: string }) => Promise<void>
  unlink: (params: { accessToken: string; identityId: string; fields?: string }) => Promise<void>
  refreshTokens: (params: { accessToken: string }) => Promise<AuthResult>
  loginFromSession: (options?: AuthOptions) => Promise<void>
  checkSession: (options?: AuthOptions) => Promise<AuthResult>
  logout: (params?: { redirectTo?: string }) => Promise<void>
  getUser: (params: { accessToken: string; fields?: string }) => Promise<Profile>
  updateProfile: (params: { accessToken: string; data: Profile }) => Promise<void>
  updateEmail: (params: { accessToken: string; email: string }) => Promise<void>
  updatePassword: (params: { accessToken?: string; password: string; oldPassword?: string; userId?: string }) => Promise<void>
  updatePhoneNumber: (params: { accessToken: string; phoneNumber: string }) => Promise<void>
  verifyPhoneNumber: (params: { accessToken: string; phoneNumber: string; verificationCode: string }) => Promise<void>
  loginWithCustomToken: (params: { token: string; auth: AuthOptions }) => Promise<void>
  getSessionInfo: (params?: {}) => Promise<SessionInfo>
  checkUrlFragment: (url: string) => boolean
}

function checkParam<T>(data: T, key: keyof T) {
  const value = data[key]
  if (value === undefined && value === null) {
    throw new Error(`the reach5 creation config has errors: ${key} is not set`)
  }
}

export function createClient(creationConfig: Config): Client {
  checkParam(creationConfig, "clientId")
  checkParam(creationConfig, "domain")

  const { domain, clientId, language } = creationConfig

  const eventManager = createEventManager()
  const urlParser = createUrlParser(eventManager)

  const apiClient = rawRequest<RemoteSettings>(
    `https://${domain}/identity/v1/config?${toQueryString({ clientId, lang: language })}`
  ).then(remoteConfig => new ApiClient({
    config: {
      ...creationConfig,
      ...remoteConfig
    },
    eventManager,
    urlParser
  }))


  function signup(params: SignupParams) {
    return apiClient.then(api => api.signup(params))
  }

  function loginWithPassword(params: LoginWithPasswordParams) {
    return apiClient.then(api => api.loginWithPassword(params))
  }

  function startPasswordless(params: PasswordlessParams, options: AuthOptions = {}) {
    return apiClient.then(api => api.startPasswordless(params, options))
  }

  function verifyPasswordless(params: PasswordlessParams) {
    return apiClient.then(api => api.verifyPasswordless(params))
  }

  function loginWithSocialProvider(provider: string, options: AuthOptions = {}) {
    return apiClient.then(api => api.loginWithSocialProvider(provider, options))
  }

  function requestPasswordReset(params: { email: string }) {
    return apiClient.then(api => api.requestPasswordReset(params))
  }

  function unlink(params: { accessToken: string, identityId: string, fields?: string }) {
    return apiClient.then(api => api.unlink(params))
  }

  function refreshTokens(params: { accessToken: string }) {
    return apiClient.then(api => api.refreshTokens(params))
  }

  function loginFromSession(options: AuthOptions = {}) {
    return apiClient.then(api => api.loginFromSession(options))
  }

  function checkSession(options: AuthOptions = {}) {
    return apiClient.then(api => api.checkSession(options))
  }

  function logout(params: { redirectTo?: string } = {}) {
    return apiClient.then(api => api.logout(params))
  }

  function getUser(params: { accessToken: string, fields?: string }) {
    return apiClient.then(api => api.getUser(params))
  }

  function updateProfile(params: { accessToken: string, data: Profile }) {
    return apiClient.then(api => api.updateProfile(params))
  }

  function updateEmail(params: { accessToken: string, email: string }) {
    return apiClient.then(api => api.updateEmail(params))
  }

  function updatePassword(params: { accessToken?: string, password: string, oldPassword?: string, userId?: string }) {
    return apiClient.then(api => api.updatePassword(params))
  }

  function updatePhoneNumber(params: { accessToken: string, phoneNumber: string }) {
    return apiClient.then(api => api.updatePhoneNumber(params))
  }

  function verifyPhoneNumber(params: { accessToken: string, phoneNumber: string, verificationCode: string }) {
    return apiClient.then(api => api.verifyPhoneNumber(params))
  }

  function loginWithCustomToken(params: { token: string, auth: AuthOptions }) {
    return apiClient.then(api => api.loginWithCustomToken(params))
  }

  function getSessionInfo() {
    return apiClient.then(api => api.getSessionInfo())
  }

  function checkUrlFragment(url: string = window.location.href): boolean {
    const authResponseDetected = urlParser.checkUrlFragment(url)
    if (authResponseDetected && url === window.location.href) {
      window.location.hash = ''
    }
    return authResponseDetected
  }

  function on<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    eventManager.on(eventName, listener)

    if (eventName === 'authenticated' || eventName === 'authentication_failed') {
      // This call must be asynchronous to ensure the listener cannot be called synchronously
      // (this type of behavior is generally unexpected for the developer)
      setTimeout(() => checkUrlFragment(), 0)
    }
  }

  function off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    return eventManager.off(eventName, listener)
  }

  return {
    on,
    off,
    signup,
    loginWithPassword,
    startPasswordless,
    verifyPasswordless,
    loginWithSocialProvider,
    requestPasswordReset,
    unlink,
    refreshTokens,
    loginFromSession,
    checkSession,
    logout,
    getUser,
    updateProfile,
    updateEmail,
    updatePassword,
    updatePhoneNumber,
    verifyPhoneNumber,
    loginWithCustomToken,
    getSessionInfo,
    checkUrlFragment
  }
}
