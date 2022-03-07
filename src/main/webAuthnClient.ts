import { AuthOptions } from './authOptions'
import { AuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { HttpClient } from './httpClient'
import {
  CredentialRequestOptionsSerialized,
  DeviceCredential,
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

/**
 * Identity Rest API Client
 */
export default class WebAuthnClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager
  }

  signupWithWebAuthn(params: SignupWithWebAuthnParams, auth?: AuthOptions): Promise<AuthResult> {
    if (window.PublicKeyCredential) {
      const body = {
        origin: window.location.origin,
        clientId: this.config.clientId,
        friendlyName: params.friendlyName || window.navigator.platform,
        profile: params.profile,
        scope: this.resolveScope(auth),
        redirectUrl: params.redirectUrl,
        returnToAfterEmailConfirmation: params.returnToAfterEmailConfirmation
      }

      const registrationOptionsPromise = this.http.post<RegistrationOptions>('/webauthn/signup-options', { body })

      const credentialsPromise = registrationOptionsPromise.then(response => {
        const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey)

        return navigator.credentials.create({ publicKey })
      })

      return Promise.all([registrationOptionsPromise, credentialsPromise])
        .then(([registrationOptions, credentials]) => {
          if (!credentials || credentials.type !== publicKeyCredentialType) {
            return Promise.reject(new Error('Unable to register invalid public key credentials.'))
          }

          const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials)

          return this.http
            .post<AuthenticationToken>('/webauthn/signup', {
              body: {
                publicKeyCredential: serializedCredentials,
                webauthnId: registrationOptions.options.publicKey.user.id
              }
            })
            .then(tkn => this.loginCallback(tkn, auth))
        })
        .catch(err => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)

          return Promise.reject(err)
        })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  loginWithWebAuthn(params: LoginWithWebAuthnParams): Promise<AuthResult> {
    if (window.PublicKeyCredential) {
      const body = {
        clientId: this.config.clientId,
        origin: window.location.origin,
        scope: this.resolveScope(params.auth),
        email: (params as EmailLoginWithWebAuthnParams).email,
        phoneNumber: (params as PhoneNumberLoginWithWebAuthnParams).phoneNumber
      }

      return this.http
          .post<CredentialRequestOptionsSerialized>('/webauthn/authentication-options', { body })
          .then(response => {
            const options = encodePublicKeyCredentialRequestOptions(response.publicKey)

            return navigator.credentials.get({ publicKey: options })
          })
          .then(credentials => {
            if (!credentials || credentials.type !== publicKeyCredentialType) {
              return Promise.reject(new Error('Unable to authenticate with invalid public key credentials.'))
            }

            const serializedCredentials = serializeAuthenticationPublicKeyCredential(credentials)

            return this.http
                .post<AuthenticationToken>('/webauthn/authentication', { body: { ...serializedCredentials } })
                .then(tkn => this.loginCallback(tkn, params.auth))
          })
          .catch(err => {
            if (err.error) this.eventManager.fireEvent('login_failed', err)

            return Promise.reject(err)
          })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  addNewWebAuthnDevice(accessToken: string, friendlyName?: string): Promise<void> {
    if (window.PublicKeyCredential) {
      const body = {
        origin: window.location.origin,
        friendlyName: friendlyName || window.navigator.platform
      }

      return this.http
        .post<RegistrationOptions>('/webauthn/registration-options', { body, accessToken })
        .then(response => {
          const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey)

          return navigator.credentials.create({ publicKey })
        })
        .then(credentials => {
          if (!credentials || credentials.type !== publicKeyCredentialType) {
            return Promise.reject(new Error('Unable to register invalid public key credentials.'))
          }

          const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials)

          return this.http.post<void>('/webauthn/registration', { body: { ...serializedCredentials }, accessToken })
        })
        .catch(err => {
          if (err.error) this.eventManager.fireEvent('login_failed', err)

          return Promise.reject(err)
        })
    } else {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
  }

  listWebAuthnDevices(accessToken: string): Promise<DeviceCredential[]> {
    return this.http.get<DeviceCredential[]>('/webauthn/registration', { accessToken })
  }

  removeWebAuthnDevice(accessToken: string, deviceId: string): Promise<void> {
    return this.http.remove<void>(`/webauthn/registration/${deviceId}`, { accessToken })
  }
}
