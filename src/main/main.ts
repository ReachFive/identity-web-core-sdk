import * as v from 'validation.ts'
import { Profile, RemoteSettings, SessionInfo } from './models'
import ApiClient, { LoginWithPasswordParams, PasswordlessParams, SignupParams, OauthAuthorizationCode, UpdatePasswordParams } from './apiClient'
import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import createEventManager, { Events, IdentityEventManager } from './identityEventManager'
import createUrlParser, { UrlParser } from './urlParser'
import { toQueryString } from '../utils/queryString'
import { rawRequest } from './httpClient'
import { PkceCode, generatePkceCode } from './pkce'

export { AuthResult } from './authResult'
export { AuthOptions } from './authOptions'
export { Profile, SessionInfo } from './models'

const configValidator = v.object({
  clientId: v.string,
  domain: v.string,
  language: v.optional(v.string)
})

export type Config = typeof configValidator.T

export class Client {
  private eventManager: IdentityEventManager
  private urlParser: UrlParser
  private apiClient: ApiClient
  private pkceCode?: PkceCode

  constructor(config: Config, remote: RemoteSettings) {
    this.eventManager = createEventManager()
    this.urlParser = createUrlParser(this.eventManager)
    this.apiClient = new ApiClient({
      config: {
        ...config,
        ...remote
      },
      eventManager: this.eventManager,
      urlParser: this.urlParser,
    })
  }

  signup(params: SignupParams): Promise<void> {
    return this.apiClient.signup(params)
  }

  loginWithPassword(params: LoginWithPasswordParams): Promise<void> {
    return this.apiClient.loginWithPassword(params)
  }

  loginWithSocialProvider(provider: string, options?: AuthOptions, pkceEnabled: boolean = false, pkceSize: number = 100): Promise<void> {
    if (pkceEnabled) {
      return this.apiClient.loginWithSocialProvider(provider, options)
    } else {
      return generatePkceCode(pkceSize).then(pkce => {
        this.pkceCode = pkce
        return this.apiClient.loginWithSocialProvider(provider, {
          ...options,
          codeChallenge: pkce.codeChallenge,
          codeChallengeMethod: pkce.codeChallengeMethod,
        })
      })
    }
  }

  loginFromSession(options?: AuthOptions): Promise<void> {
    return this.apiClient.loginFromSession(options)
  }

  loginWithCustomToken(params: { token: string; auth: AuthOptions }): Promise<void> {
    return Promise.resolve(this.apiClient.loginWithCustomToken(params))
  }

  refreshTokens(params: { accessToken: string }): Promise<AuthResult> {
    return this.apiClient.refreshTokens(params)
  }

  logout(params?: { redirectTo?: string }): Promise<void> {
    return Promise.resolve(this.apiClient.logout(params))
  }

  getUser(params: { accessToken: string; fields?: string }): Promise<Profile> {
    return this.apiClient.getUser(params)
  }

  getSessionInfo(): Promise<SessionInfo> {
    return this.apiClient.getSessionInfo()
  }

  checkSession(options?: AuthOptions): Promise<AuthResult> {
    return this.apiClient.checkSession(options)
  }

  unlink(params: { accessToken: string; identityId: string; fields?: string }): Promise<void> {
    return this.apiClient.unlink(params)
  }

  updateProfile(params: { accessToken: string; data: Profile }): Promise<void> {
    return this.apiClient.updateProfile(params)
  }

  updateEmail(params: { accessToken: string; email: string }): Promise<void> {
    return this.apiClient.updateEmail(params)
  }

  updatePassword(params: UpdatePasswordParams): Promise<void> {
    return this.apiClient.updatePassword(params)
  }

  updatePhoneNumber(params: { accessToken: string; phoneNumber: string }): Promise<void> {
    return this.apiClient.updatePhoneNumber(params)
  }

  verifyPhoneNumber(params: { accessToken: string; phoneNumber: string; verificationCode: string }): Promise<void> {
    return this.apiClient.verifyPhoneNumber(params)
  }

  startPasswordless(params: PasswordlessParams, options?: AuthOptions): Promise<void> {
    return this.apiClient.startPasswordless(params, options)
  }

  verifyPasswordless(params: PasswordlessParams): Promise<void> {
    return this.apiClient.verifyPasswordless(params)
  }

  requestPasswordReset(params: { email: string }): Promise<void> {
    return this.apiClient.requestPasswordReset(params)
  }

  authorizationCode(options: OauthAuthorizationCode): Promise<any> {
    return this.apiClient.authorizationCode({
      ...options,
      code_verifier: this.pkceCode && this.pkceCode.codeVerifier
    })
  }

  on<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    this.eventManager.on(eventName, listener)

    if (eventName === 'authenticated' || eventName === 'authentication_failed') {
      // This call must be asynchronous to ensure the listener cannot be called synchronously
      // (this type of behavior is generally unexpected for the developer)
      setTimeout(() => this.checkUrlFragment(), 0)
    }
  }

  checkUrlFragment(url: string = window.location.href): boolean {
    const authResponseDetected = this.urlParser.checkUrlFragment(url)
    if (authResponseDetected && url === window.location.href) {
      window.location.hash = ''
    }
    return authResponseDetected
  }

  off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void): void {
    return this.eventManager.off(eventName, listener)
  }
}

export function createClient(creationConfig: Config): Promise<Client> {
  configValidator.validate(creationConfig).mapError(err => {
    throw new Error(`the reach5 creation config has errors:\n${v.errorDebugString(err)}`)
  })

  const { domain, clientId, language } = creationConfig

  return rawRequest<RemoteSettings>(
    `https://${domain}/identity/v1/config?${toQueryString({ clientId, lang: language })}`
  ).then(remoteConfig => new Client(creationConfig, remoteConfig))
}
