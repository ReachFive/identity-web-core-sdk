import * as v from 'validation.ts'
import { ProviderId } from '../shared/providers/providers'
import { Profile } from '../shared/model'
import ApiClient, { SignupParams, LoginWithPasswordParams, PasswordlessParams, Events } from './apiClient'
import { AuthOptions } from './authOptions'
import { ApiClientConfig } from './apiClientConfig'
import { ajax } from './ajax'
import EventManager from '../lib/eventManager'
import { AuthResult } from './authResult'


const configValidator = v.object({
  clientId: v.string,
  domain: v.string
})

export type Config = typeof configValidator.T

export type Client = {
  on: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void;
  off: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void;
  signup: (params: SignupParams) => Promise<void>;
  loginWithPassword: (params: LoginWithPasswordParams) => Promise<void>;
  startPasswordless: (params: PasswordlessParams, options?: AuthOptions) => Promise<any>;
  verifyPasswordless: (params: PasswordlessParams) => Promise<void>;
  loginWithSocialProvider: (provider: ProviderId, options?: AuthOptions) => Promise<void>;
  requestPasswordReset: (params: { email: string }) => Promise<any>;
  unlink: (params: { accessToken: string; identityId: string; fields?: string }) => Promise<any>;
  refreshTokens: (params: { accessToken: string }) => Promise<AuthResult>;
  loginFromSession: (options?: AuthOptions) => Promise<void>;
  logout: (params: { redirect_to?: string }) => Promise<void>;
  getUser: (params: { accessToken: string; fields?: string }) => Promise<any>;
  updateProfile: (params: { accessToken: string; data: Profile }) => Promise<void>;
  updateEmail: (params: { accessToken: string; email: string }) => Promise<any>;
  updatePassword: (params: { accessToken?: string; password: string; oldPasssord?: string; userId?: string }) => Promise<any>;
  updatePhoneNumber: (params: { accessToken: string; phoneNumber: string }) => Promise<any>;
  verifyPhoneNumber: (params: { accessToken: string; phoneNumber: string; verificationCode: string }) => Promise<void>;
  loginWithCustomToken: (params: { token: string; auth: AuthOptions }) => Promise<void>;
  getSsoData: (params?: {}) => Promise<any>;
  // parseUrlFragment: (url: string) => boolean;
  // checkFragment: (url?: string) => AuthResult | ErrorResponse | undefined
}

export function createClient(creationConfig: Config): Client {
  configValidator.validate(creationConfig)
    .mapError(err => { throw `the reach5 creation config has errors:\n${v.errorDebugString(err)}` })

  const { domain, clientId } = creationConfig
  const eventManager = new EventManager<Events>()


  const apiClient = ajax<ApiClientConfig>({
    url: `https://${domain}/identity/v1/config?client_id=${clientId}`,
  })
  .then(config => new ApiClient(config, eventManager))


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

  function loginWithSocialProvider(provider: ProviderId, options: AuthOptions = {}) {
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

  function logout(params: { redirect_to?: string }) {
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

  function updatePassword(params: { accessToken?: string, password: string, oldPasssord?: string, userId?: string }) {
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

  function getSsoData(params = {}) {
    return apiClient.then(api => api.getSsoData(params))
  }

  // TODO: Make this function synchronous (Config is not needed)
  // function parseUrlFragment(url: string): boolean {
  //   return apiClient.then(api => api.parseUrlFragment(url))
  // }

  // TODO: Make this function synchronous (Config is not needed)
  // function checkFragment(url: string = ''): AuthResult | ErrorResponse | undefined {
  //   return apiClient.then(api => api.checkFragment(url))
  // }

  function on<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) {
    return eventManager.on(eventName, listener)
  }

  function off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) {
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
    logout,
    getUser,
    updateProfile,
    updateEmail,
    updatePassword,
    updatePhoneNumber,
    verifyPhoneNumber,
    loginWithCustomToken,
    getSsoData
  }
}