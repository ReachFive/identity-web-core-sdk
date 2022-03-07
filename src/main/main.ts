import {
  Profile,
  RemoteSettings,
  SessionInfo,
  OpenIdUser,
  PasswordlessResponse,
  MFA,
} from './models'
import OauthClient, {
  LoginWithPasswordParams,
  LoginWithCredentialsParams,
  VerifyPasswordlessParams,
  SignupParams,
  TokenRequestParameters,
  RefreshTokenParams,
} from './oAuthClient'
import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import { DeviceCredential, LoginWithWebAuthnParams, SignupWithWebAuthnParams } from './webAuthnService'
import createEventManager, { Events } from './identityEventManager'
import createUrlParser from './urlParser'
import { toQueryString } from '../utils/queryString'
import { createHttpClient, rawRequest } from './httpClient'
import { initCordovaCallbackIfNecessary } from './cordovaHelper'
import MfaClient from './mfaClient'
import ProfileClient from './profileClient'
import WebAuthnClient from './webAuthnClient'
import StepUpResponse = MFA.StepUpResponse
import MfaCredentialsResponse = MFA.CredentialsResponse

export { AuthResult } from './authResult'
export { AuthOptions } from './authOptions'
export { ErrorResponse, Profile, SessionInfo, MFA, PasswordlessResponse } from './models'
export { DeviceCredential, LoginWithWebAuthnParams, SignupWithWebAuthnParams } from './webAuthnService'

export interface Config {
  clientId: string
  domain: string
  language?: string
}

export type ApiClientConfig = {
  clientId: string
  domain: string
  language?: string
  scope?: string
  sso: boolean
  pkceEnforced: boolean
  isPublic: boolean
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
  refreshTokens: (params: RefreshTokenParams) => Promise<AuthResult>
  remoteSettings: Promise<RemoteSettings>
  removeWebAuthnDevice: (accessToken: string, deviceId: string) => Promise<void>
  requestPasswordReset: (params: RequestPasswordResetParams) => Promise<void>
  sendEmailVerification: (params: EmailVerificationParams) => Promise<void>
  sendPhoneNumberVerification: (params: PhoneNumberVerificationParams) => Promise<void>
  signup: (params: SignupParams) => Promise<AuthResult>
  signupWithWebAuthn: (params: SignupWithWebAuthnParams, auth?: AuthOptions) => Promise<AuthResult>
  startMfaEmailRegistration: (params: StartMfaEmailRegistrationParams) => Promise<StartMfaEmailRegistrationResponse>
  startMfaPhoneNumberRegistration: (params: StartMfaPhoneNumberRegistrationParams) => Promise<void>
  startPasswordless: (params: PasswordlessParams, options?: Omit<AuthOptions, 'useWebMessage'>) => Promise<PasswordlessResponse>
  unlink: (params: { accessToken: string; identityId: string; fields?: string }) => Promise<void>
  updateEmail: (params: UpdateEmailParams) => Promise<void>
  updatePassword: (params: UpdatePasswordParams) => Promise<void>
  updatePhoneNumber: (params: { accessToken: string; phoneNumber: string }) => Promise<void>
  updateProfile: (params: { accessToken: string; redirectUrl?: string; data: Profile }) => Promise<void>
  verifyPasswordless: (params: VerifyPasswordlessParams) => Promise<void>
  verifyMfaPasswordless: (params: VerifyMfaPasswordlessParams) => Promise<AuthResult>
  verifyMfaEmailRegistration: (params: VerifyMfaEmailRegistrationParams) => Promise<void>
  verifyMfaPhoneNumberRegistration: (params: VerifyMfaPhoneNumberRegistrationParams) => Promise<void>
  verifyPhoneNumber: (params: { accessToken: string; phoneNumber: string; verificationCode: string }) => Promise<void>
  getMfaStepUpToken: (params: StepUpParams) => Promise<StepUpResponse>
  listMfaCredentials: (accessToken: string) => Promise<MfaCredentialsResponse>
  removeMfaPhoneNumber: (params: RemoveMfaPhoneNumberParams) => Promise<void>
  removeMfaEmail: (params: RemoveMfaEmailParams) => Promise<void>
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

  initCordovaCallbackIfNecessary(urlParser)

  const baseUrl = `https://${domain}/identity/v1`

  const remoteSettings = rawRequest<RemoteSettings>(
    `https://${domain}/identity/v1/config?${toQueryString({ clientId, lang: language })}`
  )

  const apiClients = remoteSettings.then(
    remoteConfig => {

      const config = {
        ...creationConfig,
        ...remoteConfig
      }

      const http = createHttpClient({
        baseUrl,
        language,
        acceptCookies: remoteConfig.sso
      })

      return {
        api: new OauthClient({
          config,
          http,
          eventManager
        }),
        mfa: new MfaClient({
          http
        }),
        oAuth: new OAuthClient({
          config,
          http,
          eventManager
        }),
        profile: new ProfileClient({
          config,
          http,
          eventManager
        }),
        webAuthn: new WebAuthnClient({
          config,
          http,
          eventManager
        })
      }
    }
  )

  function addNewWebAuthnDevice(accessToken: string, friendlyName?: string) {
    return apiClients.then(api => api.addNewWebAuthnDevice(accessToken, friendlyName))
  }

  function checkSession(options: AuthOptions = {}) {
    return apiClients.then(api => api.checkSession(options))
  }

  function checkUrlFragment(url: string = window.location.href): boolean {
    const authResponseDetected = urlParser.checkUrlFragment(url)
    if (authResponseDetected && url === window.location.href) {
      window.location.hash = ''
    }
    return authResponseDetected
  }

  function exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters) {
    return apiClients.then(api => api.exchangeAuthorizationCodeWithPkce(params))
  }

  function getSessionInfo() {
    return apiClients.then(api => api.getSessionInfo())
  }

  function getSignupData(signupToken: string) {
    return apiClients.then(api => api.getSignupData(signupToken))
  }

  function getUser(params: { accessToken: string; fields?: string }) {
    return apiClients.then(api => api.getUser(params))
  }

  function listWebAuthnDevices(accessToken: string) {
    return apiClients.then(api => api.listWebAuthnDevices(accessToken))
  }

  function loginFromSession(options: AuthOptions = {}) {
    return apiClients.then(api => api.loginFromSession(options))
  }

  function loginWithCredentials(params: LoginWithCredentialsParams) {
    return apiClients.then(api => api.loginWithCredentials(params))
  }

  function loginWithCustomToken(params: { token: string; auth: AuthOptions }) {
    return apiClients.then(api => api.loginWithCustomToken(params))
  }

  function loginWithPassword(params: LoginWithPasswordParams) {
    return apiClients.then(api => api.loginWithPassword(params))
  }

  function loginWithSocialProvider(provider: string, options: AuthOptions = {}) {
    return apiClients.then(api => api.loginWithSocialProvider(provider, options))
  }

  function loginWithWebAuthn(params: LoginWithWebAuthnParams) {
    return apiClients.then(api => api.loginWithWebAuthn(params))
  }

  function logout(params: { redirectTo?: string; removeCredentials?: boolean } = {}) {
    return apiClients.then(api => api.logout(params))
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

  function refreshTokens(params: RefreshTokenParams) {
    return apiClients.then(api => api.refreshTokens(params))
  }

  function removeWebAuthnDevice(accessToken: string, deviceId: string) {
    return apiClients.then(api => api.removeWebAuthnDevice(accessToken, deviceId))
  }

  function requestPasswordReset(params: RequestPasswordResetParams) {
    return apiClients.then(api => api.requestPasswordReset(params))
  }

  function sendEmailVerification(params: EmailVerificationParams) {
    return apiClients.then(api => api.sendEmailVerification(params))
  }

  function sendPhoneNumberVerification(params: PhoneNumberVerificationParams) {
    return apiClients.then(api => api.sendPhoneNumberVerification(params))
  }

  function signup(params: SignupParams) {
    return apiClients.then(api => api.signup(params))
  }

  function signupWithWebAuthn(params: SignupWithWebAuthnParams, auth?: AuthOptions) {
    return apiClients.then(api => api.signupWithWebAuthn(params, auth))
  }

  function startMfaEmailRegistration(params: StartMfaEmailRegistrationParams) {
    return apiClients.then(api => api.startMfaEmailRegistration(params))
  }

  function startMfaPhoneNumberRegistration(params: StartMfaPhoneNumberRegistrationParams) {
    return apiClients.then(api => api.startMfaPhoneNumberRegistration(params))
  }

  function startPasswordless(params: PasswordlessParams, options: AuthOptions = {}) {
    return apiClients.then(api => api.startPasswordless(params, options))
  }

  function unlink(params: { accessToken: string; identityId: string; fields?: string }) {
    return apiClients.then(api => api.unlink(params))
  }

  function updateEmail(params: UpdateEmailParams) {
    return apiClients.then(api => api.updateEmail(params))
  }

  function updatePassword(params: UpdatePasswordParams) {
    return apiClients.then(api => api.updatePassword(params))
  }

  function updatePhoneNumber(params: { accessToken: string; phoneNumber: string }) {
    return apiClients.then(api => api.updatePhoneNumber(params))
  }

  function updateProfile(params: { accessToken: string; redirectUrl?: string; data: Profile }) {
    return apiClients.then(api => api.updateProfile(params))
  }

  function verifyMfaPasswordless(params: VerifyMfaPasswordlessParams) {
    return apiClients.then(api => api.verifyMfaPasswordless(params))
  }

  function verifyMfaEmailRegistration(params: VerifyMfaEmailRegistrationParams) {
    return apiClients.then(api => api.verifyMfaEmailRegistration(params))
  }

  function verifyMfaPhoneNumberRegistration(params: VerifyMfaPhoneNumberRegistrationParams) {
    return apiClients.then(api => api.verifyMfaPhoneNumberRegistration(params))
  }

  function verifyPasswordless(params: VerifyPasswordlessParams, auth?: AuthOptions) {
    return apiClients.then(api => api.verifyPasswordless(params, auth))
  }

  function verifyPhoneNumber(params: { accessToken: string; phoneNumber: string; verificationCode: string }) {
    return apiClients.then(api => api.verifyPhoneNumber(params))
  }

  function getMfaStepUpToken(params: StepUpParams) {
    return apiClients.then(api => api.getMfaStepUpToken(params))
  }

  function listMfaCredentials(accessToken: string) {
    return apiClients.then(api => api.listMfaCredentials(accessToken))
  }

  function removeMfaPhoneNumber(params: RemoveMfaPhoneNumberParams) {
    return apiClients.then(api => api.removeMfaPhoneNumber(params))
  }

  function removeMfaEmail(params: RemoveMfaEmailParams) {
    return apiClients.then(api => api.removeMfaEmail(params))
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
    startMfaEmailRegistration,
    startMfaPhoneNumberRegistration,
    startPasswordless,
    unlink,
    updateEmail,
    updatePassword,
    updatePhoneNumber,
    updateProfile,
    verifyPasswordless,
    verifyMfaPasswordless,
    verifyMfaEmailRegistration,
    verifyMfaPhoneNumberRegistration,
    verifyPhoneNumber,
    getMfaStepUpToken,
    listMfaCredentials,
    removeMfaPhoneNumber,
    removeMfaEmail,
  }
}
