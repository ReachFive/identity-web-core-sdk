import {
  Profile,
  RemoteSettings,
  SessionInfo,
  OpenIdUser,
  PasswordlessResponse,
  MFA,
} from './models'
import OAuthClient, {
  LoginWithPasswordParams,
  LoginWithCredentialsParams,
  VerifyPasswordlessParams,
  SignupParams,
  TokenRequestParameters,
  RefreshTokenParams, SingleFactorPasswordlessParams,
} from './oAuthClient'
import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import { DeviceCredential, LoginWithWebAuthnParams, SignupWithWebAuthnParams } from './webAuthnService'
import createEventManager, { Events } from './identityEventManager'
import createUrlParser from './urlParser'
import { toQueryString } from '../utils/queryString'
import { createHttpClient, rawRequest } from './httpClient'
import { initCordovaCallbackIfNecessary } from './cordovaHelper'
import MfaClient, {
  RemoveMfaEmailParams,
  RemoveMfaPhoneNumberParams,
  StartMfaEmailRegistrationParams,
  StartMfaEmailRegistrationResponse,
  StartMfaPhoneNumberRegistrationParams,
  StepUpParams, VerifyMfaEmailRegistrationParams,
  VerifyMfaPasswordlessParams,
  VerifyMfaPhoneNumberRegistrationParams
} from './mfaClient'
import ProfileClient, {
  EmailVerificationParams,
  PhoneNumberVerificationParams,
  RequestPasswordResetParams, UpdateEmailParams, UpdatePasswordParams
} from './profileClient'
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
  startPasswordless: (params: SingleFactorPasswordlessParams, options?: Omit<AuthOptions, 'useWebMessage'>) => Promise<PasswordlessResponse>
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
        oAuth: new OAuthClient({
          config,
          http,
          eventManager
        }),
        mfa: new MfaClient({
          config,
          http
        }),
        webAuthn: new WebAuthnClient({
          config,
          http,
          eventManager
        }),
        profile: new ProfileClient({
          config,
          http,
          eventManager
        })
      }
    }
  )

  function addNewWebAuthnDevice(accessToken: string, friendlyName?: string) {
    return apiClients.then(clients => clients.webAuthn.addNewWebAuthnDevice(accessToken, friendlyName))
  }

  function checkSession(options: AuthOptions = {}) {
    return apiClients.then(clients => clients.oAuth.checkSession(options))
  }

  function checkUrlFragment(url: string = window.location.href): boolean {
    const authResponseDetected = urlParser.checkUrlFragment(url)
    if (authResponseDetected && url === window.location.href) {
      window.location.hash = ''
    }
    return authResponseDetected
  }

  function exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters) {
    return apiClients.then(clients => clients.oAuth.exchangeAuthorizationCodeWithPkce(params))
  }

  function getMfaStepUpToken(params: StepUpParams) {
    return apiClients.then(clients => clients.mfa.getMfaStepUpToken(params))
  }

  function getSessionInfo() {
    return apiClients.then(clients => clients.oAuth.getSessionInfo())
  }

  function getSignupData(signupToken: string) {
    return apiClients.then(clients => clients.profile.getSignupData(signupToken))
  }

  function getUser(params: { accessToken: string; fields?: string }) {
    return apiClients.then(clients => clients.profile.getUser(params))
  }

  function listMfaCredentials(accessToken: string) {
    return apiClients.then(clients => clients.mfa.listMfaCredentials(accessToken))
  }

  function listWebAuthnDevices(accessToken: string) {
    return apiClients.then(clients => clients.webAuthn.listWebAuthnDevices(accessToken))
  }

  function loginFromSession(options: AuthOptions = {}) {
    return apiClients.then(clients => clients.oAuth.loginFromSession(options))
  }

  function loginWithCredentials(params: LoginWithCredentialsParams) {
    return apiClients.then(clients => clients.oAuth.loginWithCredentials(params))
  }

  function loginWithCustomToken(params: { token: string; auth: AuthOptions }) {
    return apiClients.then(clients => clients.oAuth.loginWithCustomToken(params))
  }

  function loginWithPassword(params: LoginWithPasswordParams) {
    return apiClients.then(clients => clients.oAuth.loginWithPassword(params))
  }

  function loginWithSocialProvider(provider: string, options: AuthOptions = {}) {
    return apiClients.then(clients => clients.oAuth.loginWithSocialProvider(provider, options))
  }

  function loginWithWebAuthn(params: LoginWithWebAuthnParams) {
    return apiClients.then(clients => clients.webAuthn.loginWithWebAuthn(params))
  }

  function logout(params: { redirectTo?: string; removeCredentials?: boolean } = {}) {
    return apiClients.then(clients => clients.oAuth.logout(params))
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
    return apiClients.then(clients => clients.oAuth.refreshTokens(params))
  }

  function removeMfaEmail(params: RemoveMfaEmailParams) {
    return apiClients.then(clients => clients.mfa.removeMfaEmail(params))
  }

  function removeMfaPhoneNumber(params: RemoveMfaPhoneNumberParams) {
    return apiClients.then(clients => clients.mfa.removeMfaPhoneNumber(params))
  }

  function removeWebAuthnDevice(accessToken: string, deviceId: string) {
    return apiClients.then(clients => clients.webAuthn.removeWebAuthnDevice(accessToken, deviceId))
  }

  function requestPasswordReset(params: RequestPasswordResetParams) {
    return apiClients.then(clients => clients.profile.requestPasswordReset(params))
  }

  function sendEmailVerification(params: EmailVerificationParams) {
    return apiClients.then(clients => clients.profile.sendEmailVerification(params))
  }

  function sendPhoneNumberVerification(params: PhoneNumberVerificationParams) {
    return apiClients.then(clients => clients.profile.sendPhoneNumberVerification(params))
  }

  function signup(params: SignupParams) {
    return apiClients.then(clients => clients.oAuth.signup(params))
  }

  function signupWithWebAuthn(params: SignupWithWebAuthnParams, auth?: AuthOptions) {
    return apiClients.then(clients => clients.webAuthn.signupWithWebAuthn(params, auth))
  }

  function startMfaEmailRegistration(params: StartMfaEmailRegistrationParams) {
    return apiClients.then(clients => clients.mfa.startMfaEmailRegistration(params))
  }

  function startMfaPhoneNumberRegistration(params: StartMfaPhoneNumberRegistrationParams) {
    return apiClients.then(clients => clients.mfa.startMfaPhoneNumberRegistration(params))
  }

  function startPasswordless(params: SingleFactorPasswordlessParams, options: AuthOptions = {}) {
    return apiClients.then(clients => clients.oAuth.startPasswordless(params, options))
  }

  function unlink(params: { accessToken: string; identityId: string; fields?: string }) {
    return apiClients.then(clients => clients.profile.unlink(params))
  }

  function updateEmail(params: UpdateEmailParams) {
    return apiClients.then(clients => clients.profile.updateEmail(params))
  }

  function updatePassword(params: UpdatePasswordParams) {
    return apiClients.then(clients => clients.profile.updatePassword(params))
  }

  function updatePhoneNumber(params: { accessToken: string; phoneNumber: string }) {
    return apiClients.then(clients => clients.profile.updatePhoneNumber(params))
  }

  function updateProfile(params: { accessToken: string; redirectUrl?: string; data: Profile }) {
    return apiClients.then(clients => clients.profile.updateProfile(params))
  }

  function verifyMfaEmailRegistration(params: VerifyMfaEmailRegistrationParams) {
    return apiClients.then(clients => clients.mfa.verifyMfaEmailRegistration(params))
  }

  function verifyMfaPasswordless(params: VerifyMfaPasswordlessParams) {
    return apiClients.then(clients => clients.mfa.verifyMfaPasswordless(params))
  }

  function verifyMfaPhoneNumberRegistration(params: VerifyMfaPhoneNumberRegistrationParams) {
    return apiClients.then(clients => clients.mfa.verifyMfaPhoneNumberRegistration(params))
  }

  function verifyPasswordless(params: VerifyPasswordlessParams, auth?: AuthOptions) {
    return apiClients.then(clients => clients.oAuth.verifyPasswordless(params, auth))
  }

  function verifyPhoneNumber(params: { accessToken: string; phoneNumber: string; verificationCode: string }) {
    return apiClients.then(clients => clients.profile.verifyPhoneNumber(params))
  }

  return {
    addNewWebAuthnDevice,
    checkSession,
    checkUrlFragment,
    exchangeAuthorizationCodeWithPkce,
    getMfaStepUpToken,
    getSessionInfo,
    getSignupData,
    getUser,
    listMfaCredentials,
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
    removeMfaEmail,
    removeMfaPhoneNumber,
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
    verifyMfaEmailRegistration,
    verifyMfaPasswordless,
    verifyMfaPhoneNumberRegistration,
    verifyPasswordless,
    verifyPhoneNumber,
  }
}
