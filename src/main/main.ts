import { Profile, RemoteSettings, SessionInfo, OpenIdUser } from './models'
import ApiClient, {
  LoginWithPasswordParams,
  LoginWithCredentialsParams,
  PasswordlessParams,
  VerifyPasswordlessParams,
  RequestPasswordResetParams,
  SignupParams,
  UpdatePasswordParams,
  UpdateEmailParams,
  TokenRequestParameters,
  EmailVerificationParams,
  PhoneNumberVerificationParams,
  StartMfaPhoneNumberRegistrationParams,
  VerifyMfaPhoneNumberRegistrationParams
} from './apiClient'
import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import { DeviceCredential, LoginWithWebAuthnParams, SignupWithWebAuthnParams } from './webAuthnService'
import createEventManager, { Events } from './identityEventManager'
import createUrlParser from './urlParser'
import { toQueryString } from '../utils/queryString'
import { rawRequest } from './httpClient'

export { AuthResult } from './authResult'
export { AuthOptions } from './authOptions'
export { ErrorResponse, Profile, SessionInfo } from './models'
export { DeviceCredential, LoginWithWebAuthnParams, SignupWithWebAuthnParams } from './webAuthnService'

export interface Config {
  clientId: string
  domain: string
  language?: string
}

export type Client = {
  addNewWebAuthnDevice: (accessToken: string, friendlyName?: string) => Promise<void>
  checkSession: (options?: AuthOptions) => Promise<AuthResult>
  checkUrlFragment: (url: string) => boolean
  exchangeAuthorizationCodeWithPkce: (params: TokenRequestParameters) => Promise<AuthResult>
  getSessionInfo: () => Promise<SessionInfo>
  getSignupData: (signupToken: string) => Promise<OpenIdUser>
  getUser: (params: { accessToken: string; fields?: string }) => Promise<Profile>
  listWebAuthnDevices: (accessToken: string) => Promise<DeviceCredential[]>
  loginFromSession: (options?: AuthOptions) => Promise<void>
  loginWithCredentials: (params: LoginWithCredentialsParams) => Promise<AuthResult>
  loginWithCustomToken: (params: { token: string; auth: AuthOptions }) => Promise<void>
  loginWithPassword: (params: LoginWithPasswordParams) => Promise<AuthResult>
  loginWithSocialProvider: (provider: string, options?: AuthOptions) => Promise<void | InAppBrowser>
  loginWithWebAuthn: (params: LoginWithWebAuthnParams) => Promise<AuthResult>
  logout: (params?: { redirectTo?: string; removeCredentials?: boolean }) => Promise<void>
  off: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  on: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  refreshTokens: (params: { accessToken: string }) => Promise<AuthResult>
  remoteSettings: Promise<RemoteSettings>
  removeWebAuthnDevice: (accessToken: string, deviceId: string) => Promise<void>
  requestPasswordReset: (params: RequestPasswordResetParams) => Promise<void>
  sendEmailVerification: (params: EmailVerificationParams) => Promise<void>
  sendPhoneNumberVerification: (params: PhoneNumberVerificationParams) => Promise<void>
  signup: (params: SignupParams) => Promise<AuthResult>
  signupWithWebAuthn: (params: SignupWithWebAuthnParams, auth?: AuthOptions) => Promise<AuthResult>
  startMfaPhoneNumberRegistration: (params: StartMfaPhoneNumberRegistrationParams) => Promise<void>
  startPasswordless: (params: PasswordlessParams, options?: Omit<AuthOptions, 'useWebMessage'>) => Promise<void>
  unlink: (params: { accessToken: string; identityId: string; fields?: string }) => Promise<void>
  updateEmail: (params: UpdateEmailParams) => Promise<void>
  updatePassword: (params: UpdatePasswordParams) => Promise<void>
  updatePhoneNumber: (params: { accessToken: string; phoneNumber: string }) => Promise<void>
  updateProfile: (params: { accessToken: string; redirectUrl?: string; data: Profile }) => Promise<void>
  verifyPasswordless: (params: VerifyPasswordlessParams) => Promise<void>
  verifyMfaPhoneNumberRegistration: (params: VerifyMfaPhoneNumberRegistrationParams) => Promise<void>
  verifyPhoneNumber: (params: { accessToken: string; phoneNumber: string; verificationCode: string }) => Promise<void>
}

function checkParam<T>(data: T, key: keyof T) {
  const value = data[key]
  if (value === undefined || value === null) {
    throw new Error(`The reach5 creation config has errors: ${key as string} is not set`)
  }
}

export function createClient(creationConfig: Config): Client {
  checkParam(creationConfig, 'domain')
  checkParam(creationConfig, 'clientId')

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

  function addNewWebAuthnDevice(accessToken: string, friendlyName?: string) {
    return apiClient.then(api => api.addNewWebAuthnDevice(accessToken, friendlyName))
  }

  function checkSession(options: AuthOptions = {}) {
    return apiClient.then(api => api.checkSession(options))
  }

  function checkUrlFragment(url: string = window.location.href): boolean {
    const authResponseDetected = urlParser.checkUrlFragment(url)
    if (authResponseDetected && url === window.location.href) {
      window.location.hash = ''
    }
    return authResponseDetected
  }

  function exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters) {
    return apiClient.then(api => api.exchangeAuthorizationCodeWithPkce(params))
  }

  function getSessionInfo() {
    return apiClient.then(api => api.getSessionInfo())
  }

  function getSignupData(signupToken: string) {
    return apiClient.then(api => api.getSignupData(signupToken))
  }

  function getUser(params: { accessToken: string; fields?: string }) {
    return apiClient.then(api => api.getUser(params))
  }

  function listWebAuthnDevices(accessToken: string) {
    return apiClient.then(api => api.listWebAuthnDevices(accessToken))
  }

  function loginFromSession(options: AuthOptions = {}) {
    return apiClient.then(api => api.loginFromSession(options))
  }

  function loginWithCredentials(params: LoginWithCredentialsParams) {
    return apiClient.then(api => api.loginWithCredentials(params))
  }

  function loginWithCustomToken(params: { token: string; auth: AuthOptions }) {
    return apiClient.then(api => api.loginWithCustomToken(params))
  }

  function loginWithPassword(params: LoginWithPasswordParams) {
    return apiClient.then(api => api.loginWithPassword(params))
  }

  function loginWithSocialProvider(provider: string, options: AuthOptions = {}) {
    return apiClient.then(api => api.loginWithSocialProvider(provider, options))
  }

  function loginWithWebAuthn(params: LoginWithWebAuthnParams) {
    return apiClient.then(api => api.loginWithWebAuthn(params))
  }

  function logout(params: { redirectTo?: string; removeCredentials?: boolean } = {}) {
    return apiClient.then(api => api.logout(params))
  }

  function off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    return eventManager.off(eventName, listener)
  }

  function on<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    eventManager.on(eventName, listener)

    if ((eventName as string) === 'authenticated' || (eventName as string) === 'authentication_failed') {
      // This call must be asynchronous to ensure the listener cannot be called synchronously
      // (this type of behavior is generally unexpected for the developer)
      setTimeout(() => checkUrlFragment(), 0)
    }
  }

  function refreshTokens(params: { accessToken: string }) {
    return apiClient.then(api => api.refreshTokens(params))
  }

  function removeWebAuthnDevice(accessToken: string, deviceId: string) {
    return apiClient.then(api => api.removeWebAuthnDevice(accessToken, deviceId))
  }

  function requestPasswordReset(params: RequestPasswordResetParams) {
    return apiClient.then(api => api.requestPasswordReset(params))
  }

  function sendEmailVerification(params: EmailVerificationParams) {
    return apiClient.then(api => api.sendEmailVerification(params))
  }

  function sendPhoneNumberVerification(params: PhoneNumberVerificationParams) {
    return apiClient.then(api => api.sendPhoneNumberVerification(params))
  }

  function signup(params: SignupParams) {
    return apiClient.then(api => api.signup(params))
  }

  function signupWithWebAuthn(params: SignupWithWebAuthnParams, auth?: AuthOptions) {
    return apiClient.then(api => api.signupWithWebAuthn(params, auth))
  }

  function startMfaPhoneNumberRegistration(params: StartMfaPhoneNumberRegistrationParams) {
    return apiClient.then(api => api.startMfaPhoneNumberRegistration(params))
  }

  function startPasswordless(params: PasswordlessParams, options: AuthOptions = {}) {
    return apiClient.then(api => api.startPasswordless(params, options))
  }

  function unlink(params: { accessToken: string; identityId: string; fields?: string }) {
    return apiClient.then(api => api.unlink(params))
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

  function updateProfile(params: { accessToken: string; redirectUrl?: string; data: Profile }) {
    return apiClient.then(api => api.updateProfile(params))
  }

  function verifyMfaPhoneNumberRegistration(params: VerifyMfaPhoneNumberRegistrationParams) {
    return apiClient.then(api => api.verifyMfaPhoneNumberRegistration(params))
  }

  function verifyPasswordless(params: VerifyPasswordlessParams, auth?: AuthOptions) {
    return apiClient.then(api => api.verifyPasswordless(params, auth))
  }

  function verifyPhoneNumber(params: { accessToken: string; phoneNumber: string; verificationCode: string }) {
    return apiClient.then(api => api.verifyPhoneNumber(params))
  }

  return {
    addNewWebAuthnDevice,
    checkSession,
    checkUrlFragment,
    exchangeAuthorizationCodeWithPkce,
    getSessionInfo,
    getSignupData,
    getUser,
    listWebAuthnDevices,
    loginFromSession,
    loginWithCredentials,
    loginWithCustomToken,
    loginWithPassword,
    loginWithSocialProvider,
    loginWithWebAuthn,
    logout,
    off,
    on,
    refreshTokens,
    remoteSettings,
    removeWebAuthnDevice,
    requestPasswordReset,
    sendEmailVerification,
    sendPhoneNumberVerification,
    signup,
    signupWithWebAuthn,
    startMfaPhoneNumberRegistration,
    startPasswordless,
    unlink,
    updateEmail,
    updatePassword,
    updatePhoneNumber,
    updateProfile,
    verifyPasswordless,
    verifyMfaPhoneNumberRegistration,
    verifyPhoneNumber
  }
}
