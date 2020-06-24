import { Profile, RemoteSettings, SessionInfo, OpenIdUser } from './models'
import ApiClient, {
  LoginWithPasswordParams,
  LoginWithCredentialsParams,
  LoginWithWebAuthnParams,
  PasswordlessParams,
  VerifyPasswordlessParams,
  RequestPasswordResetParams,
  SignupParams,
  UpdatePasswordParams,
  UpdateEmailParams,
  TokenRequestParameters,
  EmailVerificationParams,
  PhoneNumberVerificationParams
} from './apiClient'
import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import { DeviceCredential } from './webAuthnService'
import createEventManager, { Events } from './identityEventManager'
import createUrlParser from './urlParser'
import { toQueryString } from '../utils/queryString'
import { rawRequest } from './httpClient'

export { AuthResult } from './authResult'
export { AuthOptions } from './authOptions'
export { ErrorResponse, Profile, SessionInfo } from './models'
export { DeviceCredential } from './webAuthnService'

export interface Config {
  clientId: string
  domain: string
  language?: string
}

export type Client = {
  remoteSettings: Promise<RemoteSettings>
  on: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  off: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  signup: (params: SignupParams) => Promise<void>
  getSignupData: (signupToken: string) => Promise<OpenIdUser>
  loginWithPassword: (params: LoginWithPasswordParams) => Promise<void>
  sendEmailVerification: (params: EmailVerificationParams) => Promise<void>
  sendPhoneNumberVerification: (params: PhoneNumberVerificationParams) => Promise<void>
  startPasswordless: (params: PasswordlessParams, options?: AuthOptions) => Promise<void>
  verifyPasswordless: (params: VerifyPasswordlessParams) => Promise<void>
  loginWithSocialProvider: (provider: string, options?: AuthOptions) => Promise<void>
  exchangeAuthorizationCodeWithPkce: (params: TokenRequestParameters) => Promise<void>
  requestPasswordReset: (params: RequestPasswordResetParams) => Promise<void>
  unlink: (params: { accessToken: string; identityId: string; fields?: string }) => Promise<void>
  refreshTokens: (params: { accessToken: string }) => Promise<AuthResult>
  loginFromSession: (options?: AuthOptions) => Promise<void>
  checkSession: (options?: AuthOptions) => Promise<AuthResult>
  logout: (params?: { redirectTo?: string; removeCredentials?: boolean }) => Promise<void>
  getUser: (params: { accessToken: string; fields?: string }) => Promise<Profile>
  updateProfile: (params: { accessToken: string; redirectUrl?: string; data: Profile }) => Promise<void>
  updateEmail: (params: UpdateEmailParams) => Promise<void>
  updatePassword: (params: UpdatePasswordParams) => Promise<void>
  updatePhoneNumber: (params: { accessToken: string; phoneNumber: string }) => Promise<void>
  verifyPhoneNumber: (params: { accessToken: string; phoneNumber: string; verificationCode: string }) => Promise<void>
  loginWithCustomToken: (params: { token: string; auth: AuthOptions }) => Promise<void>
  loginWithCredentials: (params: LoginWithCredentialsParams) => Promise<void>
  addNewWebAuthnDevice: (accessToken: string) => Promise<void>
  loginWithWebAuthn: (params: LoginWithWebAuthnParams) => Promise<void>
  listWebAuthnDevices: (accessToken: string) => Promise<DeviceCredential[]>
  removeWebAuthnDevice: (accessToken: string, deviceId: string) => Promise<void>
  getSessionInfo: (params?: {}) => Promise<SessionInfo>
  checkUrlFragment: (url: string) => boolean
}

function checkParam<T>(data: T, key: keyof T) {
  const value = data[key]
  if (value === undefined || value === null) {
    throw new Error(`the reach5 creation config has errors: ${key as string} is not set`)
  }
}

export function createClient(creationConfig: Config): Client {
  checkParam(creationConfig, 'clientId')
  checkParam(creationConfig, 'domain')

  const { domain, clientId, language } = creationConfig

  const eventManager = createEventManager()
  const urlParser = createUrlParser(eventManager)

  const remoteSettings = rawRequest<RemoteSettings>(
    `https://${domain}/identity/v1/config?${toQueryString({ clientId, lang: language })}`
  )

  const apiClient = remoteSettings.then(
    remoteConfig =>
      new ApiClient({
        config: {
          ...creationConfig,
          ...remoteConfig
        },
        eventManager,
        urlParser
      })
  )

  function signup(params: SignupParams) {
    return apiClient.then(api => api.signup(params))
  }

  function getSignupData(signupToken: string) {
    return apiClient.then(api => api.getSignupData(signupToken))
  }

  function loginWithPassword(params: LoginWithPasswordParams) {
    return apiClient.then(api => api.loginWithPassword(params))
  }

  function sendEmailVerification(params: EmailVerificationParams) {
    return apiClient.then(api => api.sendEmailVerification(params))
  }

  function sendPhoneNumberVerification(params: PhoneNumberVerificationParams) {
    return apiClient.then(api => api.sendPhoneNumberVerification(params))
  }

  function startPasswordless(params: PasswordlessParams, options: AuthOptions = {}) {
    return apiClient.then(api => api.startPasswordless(params, options))
  }

  function verifyPasswordless(params: VerifyPasswordlessParams) {
    return apiClient.then(api => api.verifyPasswordless(params))
  }

  function loginWithSocialProvider(provider: string, options: AuthOptions = {}) {
    return apiClient.then(api => api.loginWithSocialProvider(provider, options))
  }

  function exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters) {
    return apiClient.then(api => api.exchangeAuthorizationCodeWithPkce(params))
  }

  function requestPasswordReset(params: RequestPasswordResetParams) {
    return apiClient.then(api => api.requestPasswordReset(params))
  }

  function unlink(params: { accessToken: string; identityId: string; fields?: string }) {
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

  function logout(params: { redirectTo?: string; removeCredentials?: boolean } = {}) {
    return apiClient.then(api => api.logout(params))
  }

  function getUser(params: { accessToken: string; fields?: string }) {
    return apiClient.then(api => api.getUser(params))
  }

  function updateProfile(params: { accessToken: string; redirectUrl?: string; data: Profile }) {
    return apiClient.then(api => api.updateProfile(params))
  }

  function updateEmail(params: UpdateEmailParams) {
    return apiClient.then(api => api.updateEmail(params))
  }

  function updatePassword(params: UpdatePasswordParams) {
    return apiClient.then(api => api.updatePassword(params))
  }

  function updatePhoneNumber(params: { accessToken: string; phoneNumber: string }) {
    return apiClient.then(api => api.updatePhoneNumber(params))
  }

  function verifyPhoneNumber(params: { accessToken: string; phoneNumber: string; verificationCode: string }) {
    return apiClient.then(api => api.verifyPhoneNumber(params))
  }

  function loginWithCustomToken(params: { token: string; auth: AuthOptions }) {
    return apiClient.then(api => api.loginWithCustomToken(params))
  }

  function loginWithCredentials(params: LoginWithCredentialsParams) {
    return apiClient.then(api => api.loginWithCredentials(params))
  }

  function addNewWebAuthnDevice(accessToken: string) {
    return apiClient.then(api => api.addNewWebAuthnDevice(accessToken))
  }

  function loginWithWebAuthn(params: LoginWithWebAuthnParams) {
    return apiClient.then(api => api.loginWithWebAuthn(params))
  }

  function listWebAuthnDevices(accessToken: string) {
    return apiClient.then(api => api.listWebAuthnDevices(accessToken))
  }

  function removeWebAuthnDevice(accessToken: string, deviceId: string) {
    return apiClient.then(api => api.removeWebAuthnDevice(accessToken, deviceId))
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

    if ((eventName as string) === 'authenticated' || (eventName as string) === 'authentication_failed') {
      // This call must be asynchronous to ensure the listener cannot be called synchronously
      // (this type of behavior is generally unexpected for the developer)
      setTimeout(() => checkUrlFragment(), 0)
    }
  }

  function off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    return eventManager.off(eventName, listener)
  }

  return {
    remoteSettings,
    on,
    off,
    signup,
    getSignupData,
    loginWithPassword,
    sendEmailVerification,
    sendPhoneNumberVerification,
    startPasswordless,
    verifyPasswordless,
    loginWithSocialProvider,
    exchangeAuthorizationCodeWithPkce,
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
    loginWithCredentials,
    addNewWebAuthnDevice,
    loginWithWebAuthn,
    listWebAuthnDevices,
    removeWebAuthnDevice,
    getSessionInfo,
    checkUrlFragment
  }
}
