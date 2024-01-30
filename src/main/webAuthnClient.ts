import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { HttpClient } from './httpClient'
import {
  CredentialRequestOptionsSerialized,
  DeviceCredential,
  DiscoverableLoginWithWebAuthnParams,
  EmailLoginWithWebAuthnParams,
  encodePublicKeyCredentialCreationOptions,
  encodePublicKeyCredentialRequestOptions,
  LoginWithWebAuthnParams,
  PhoneNumberLoginWithWebAuthnParams,
  publicKeyCredentialType,
  RegistrationOptions,
  serializeAuthenticationPublicKeyCredential,
  serializeRegistrationPublicKeyCredential,
  SignupWithWebAuthnParams
} from './webAuthnService'
import { ApiClientConfig } from './main'
import OAuthClient from './oAuthClient'
import { resolveScope } from './scopeHelper'
import { AuthenticationToken } from './models'

/**
 * Identity Rest API Client
 */
export default class WebAuthnClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager
  private oAuthClient: OAuthClient

  private authenticationOptionsUrl = '/webauthn/authentication-options'
  private authenticationUrl = '/webauthn/authentication'
  private registrationOptionsUrl = '/webauthn/registration-options'
  private registrationUrl = '/webauthn/registration'
  private signupOptionsUrl = '/webauthn/signup-options'
  private signupUrl = '/webauthn/signup'

  constructor(props: {
    config: ApiClientConfig
    http: HttpClient
    eventManager: IdentityEventManager
    oAuthClient: OAuthClient
  }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager
    this.oAuthClient = props.oAuthClient

    this.authenticationOptionsUrl = '/webauthn/authentication-options'
    this.authenticationUrl = '/webauthn/authentication'
    this.registrationOptionsUrl = '/webauthn/registration-options'
    this.registrationUrl = '/webauthn/registration'
    this.signupOptionsUrl = '/webauthn/signup-options'
    this.signupUrl = '/webauthn/signup'
  }

  isPublicKeyCredential(credentials: Credential): credentials is PublicKeyCredential {
    return (credentials as PublicKeyCredential).type === publicKeyCredentialType
  }

  addNewWebAuthnDevice(accessToken: string, friendlyName?: string): Promise<void> {
    if (window.PublicKeyCredential) {
      const body = {
        origin: window.location.origin,
        friendlyName: friendlyName || window.navigator.platform
      }

      return this.http
        .post<RegistrationOptions>(this.registrationOptionsUrl, { body, accessToken })
        .then((response) => {
          const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey)

          return navigator.credentials.create({ publicKey })
        })
        .then((credentials) => {
          if (!credentials || !this.isPublicKeyCredential(credentials)) {
            return Promise.reject(new Error('Unable to register invalid public key credentials.'))
          }

          const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials)

          return this.http.post<void>(this.registrationUrl, { body: { ...serializedCredentials }, accessToken })
        })
        .catch((err) => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)

          return Promise.reject(err)
        })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  listWebAuthnDevices(accessToken: string): Promise<DeviceCredential[]> {
    return this.http.get<DeviceCredential[]>(this.registrationUrl, { accessToken })
  }

  private isDiscoverable(params: LoginWithWebAuthnParams): params is DiscoverableLoginWithWebAuthnParams {
    return (params as DiscoverableLoginWithWebAuthnParams).conditionalMediation !== undefined
  }

  loginWithWebAuthn(params: LoginWithWebAuthnParams): Promise<AuthResult> {
    if (window.PublicKeyCredential) {
      let authData
      if (this.isDiscoverable(params)) {
        const conditionalMediationAvailable =
          PublicKeyCredential.isConditionalMediationAvailable?.() ?? Promise.resolve(false)
        authData = conditionalMediationAvailable.then((conditionalMediationAvailable) => {
          if (params.conditionalMediation && !conditionalMediationAvailable) {
            return Promise.reject(new Error('Conditional mediation unavailable'))
          }
          return {
            body: {
              clientId: this.config.clientId,
              origin: window.location.origin,
              scope: resolveScope(params.auth, this.config.scope)
            },
            conditionalMediationAvailable: conditionalMediationAvailable
          }
        })
      } else {
        authData = Promise.resolve({
          body: {
            clientId: this.config.clientId,
            origin: window.location.origin,
            scope: resolveScope(params.auth, this.config.scope),
            email: (params as EmailLoginWithWebAuthnParams).email,
            phoneNumber: (params as PhoneNumberLoginWithWebAuthnParams).phoneNumber
          },
          conditionalMediationAvailable: false
        })
      }

      return authData.then((authData) => {
        return this.http
          .post<CredentialRequestOptionsSerialized>(this.authenticationOptionsUrl, { body: authData.body })
          .then((response) => {
            const options = encodePublicKeyCredentialRequestOptions(response.publicKey)

            if (this.isDiscoverable(params) && params.conditionalMediation && authData.conditionalMediationAvailable) {
              // do autofill query
              return navigator.credentials.get({ publicKey: options, mediation: 'conditional' })
            } else {
              // do modal query
              return navigator.credentials.get({ publicKey: options })
            }
          })
          .then((credentials) => {
            if (!credentials || !this.isPublicKeyCredential(credentials)) {
              return Promise.reject(new Error('Unable to authenticate with invalid public key credentials.'))
            }

            const serializedCredentials = serializeAuthenticationPublicKeyCredential(credentials)

            return this.http
              .post<AuthenticationToken>(this.authenticationUrl, { body: { ...serializedCredentials } })
              .then((tkn) => this.oAuthClient.loginCallback(tkn, params.auth))
          })
          .catch((err) => {
            if (err.error) this.eventManager.fireEvent('login_failed', err)

            return Promise.reject(err)
          })
      })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  removeWebAuthnDevice(accessToken: string, deviceId: string): Promise<void> {
    return this.http.remove<void>(`${this.registrationUrl}/${deviceId}`, { accessToken })
  }

  signupWithWebAuthn(params: SignupWithWebAuthnParams, auth?: AuthOptions): Promise<AuthResult> {
    if (window.PublicKeyCredential) {
      const body = {
        origin: window.location.origin,
        clientId: this.config.clientId,
        friendlyName: params.friendlyName || window.navigator.platform,
        profile: params.profile,
        scope: resolveScope(auth, this.config.scope),
        redirectUrl: params.redirectUrl,
        returnToAfterEmailConfirmation: params.returnToAfterEmailConfirmation
      }

      const registrationOptionsPromise = this.http.post<RegistrationOptions>(this.signupOptionsUrl, { body })

      const credentialsPromise = registrationOptionsPromise.then((response) => {
        const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey)

        return navigator.credentials.create({ publicKey })
      })

      return Promise.all([registrationOptionsPromise, credentialsPromise])
        .then(([registrationOptions, credentials]) => {
          if (!credentials || !this.isPublicKeyCredential(credentials)) {
            return Promise.reject(new Error('Unable to register invalid public key credentials.'))
          }

          const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials)

          return this.http
            .post<AuthenticationToken>(this.signupUrl, {
              body: {
                publicKeyCredential: serializedCredentials,
                webauthnId: registrationOptions.options.publicKey.user.id
              }
            })
            .then((tkn) => this.oAuthClient.loginCallback(tkn, auth))
        })
        .catch((err) => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)

          return Promise.reject(err)
        })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }
}
