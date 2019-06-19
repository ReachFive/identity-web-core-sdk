import { errorDebugString } from 'validation.ts'
import { ProviderId } from '../shared/providers/providers'
import { Profile } from '../shared/model'
import ApiClient, { SignupParams, LoginWithPasswordParams, PasswordlessParams, Events } from './apiClient'
import { AuthOptions } from './authOptions'
import { apiClientConfig, ApiClientConfig } from './apiClientConfig'
import EventManager from '../lib/eventManager'


export function createClient(config: ApiClientConfig) {
  apiClientConfig.validate(config).mapError(err => { throw `the reach5 creation config has errors:\n${errorDebugString(err)}` })

  const eventManager = new EventManager<Events>()
  const apiClient = Promise.resolve(new ApiClient(config, eventManager))


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

  function requestPasswordReset(params: { email: string, redirectUrl?: string }) {
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

  function updateEmail(params: { accessToken: string, email: string, redirectUrl?: string }) {
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

  function getSsoData(params = {}) {
    return apiClient.then(api => api.getSsoData(params))
  }

  function checkSession(options: AuthOptions = {}) {
    return apiClient.then(api => api.checkSession(options))
  }

  function parseUrlFragment(url: string) {
    return apiClient.then(api => api.parseUrlFragment(url))
  }

  function checkFragment(url: string = '') {
    return apiClient.then(api => api.checkFragment(url))
  }

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
    getSsoData,
    checkSession,
    parseUrlFragment,
    checkFragment
  }
}
