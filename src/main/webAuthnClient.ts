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

type EmailResetPasskeysParams = {
  email: string
  verificationCode: string
  clientId: string
  friendlyName?: string
}
type SmsResetPasskeysParams = {
  phoneNumber: string
  verificationCode: string
  clientId: string
  friendlyName?: string
}

export type ResetPasskeysParams = EmailResetPasskeysParams | SmsResetPasskeysParams

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
  private resetPasskeysOptionsUrl = '/webauthn/key-reset-options'
  private resetPasskeysUrl = '/webauthn/key-reset'
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

  resetPasskeys(params: ResetPasskeysParams): Promise<void> {
    if (window.PublicKeyCredential) {
      const body = {
        ...params,
        origin: window.location.origin,
        friendlyName: params.friendlyName || window.navigator.platform
      }

      return this.http
        .post<RegistrationOptions>(this.resetPasskeysOptionsUrl, { body })
        .then((response) => {
          const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey)

          return navigator.credentials.create({ publicKey })
        })
        .then((credentials) => {
          if (!credentials || !this.isPublicKeyCredential(credentials)) {
            return Promise.reject(new Error('Unable to register public key credentials.'))
          }

          const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials)

          return this.http.post<void>(this.resetPasskeysUrl, {
            body: { ...params, publicKeyCredential: serializedCredentials }
          })
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
    return typeof (params as DiscoverableLoginWithWebAuthnParams).conditionalMediation !== 'undefined'
  }

  private buildWebAuthnParams(params: LoginWithWebAuthnParams): Promise<LoginWithWebAuthnQueryParams> {
    const body = this.isDiscoverable(params)
      ? {
          clientId: this.config.clientId,
          origin: window.location.origin,
          scope: resolveScope(params.auth, this.config.scope)
        }
      : {
          clientId: this.config.clientId,
          origin: window.location.origin,
          scope: resolveScope(params.auth, this.config.scope),
          email: (params as EmailLoginWithWebAuthnParams).email,
          phoneNumber: (params as PhoneNumberLoginWithWebAuthnParams).phoneNumber
        }

    // to appease ESLint we have to put PublicKeyCredential in a const
    const pubKeyCred = PublicKeyCredential
    const conditionalMediationAvailable = pubKeyCred.isConditionalMediationAvailable?.() ?? Promise.resolve(false)
    return conditionalMediationAvailable.then((conditionalMediationAvailable) => {
      return {
        body,
        conditionalMediationAvailable: conditionalMediationAvailable
      }
    })
  }

  loginWithWebAuthn(params: LoginWithWebAuthnParams): Promise<AuthResult> {
    if (!window.PublicKeyCredential) {
      return Promise.reject(new Error('Unsupported WebAuthn API'))
    }
    return this.buildWebAuthnParams(params).then((queryParams) => {
      if (
        this.isDiscoverable(params) &&
        params.conditionalMediation === true &&
        !queryParams.conditionalMediationAvailable
      ) {
        return Promise.reject(new Error('Conditional mediation unavailable'))
      }
      return this.http
        .post<CredentialRequestOptionsSerialized>(this.authenticationOptionsUrl, { body: queryParams.body })
        .then((response) => {
          const options = encodePublicKeyCredentialRequestOptions(response.publicKey)
          if (
            this.isDiscoverable(params) &&
            params.conditionalMediation !== false &&
            queryParams.conditionalMediationAvailable
          ) {
            // do autofill query
            return navigator.credentials.get({ publicKey: options, mediation: 'conditional', signal: params.signal })
          }
          // do modal query
          return navigator.credentials.get({ publicKey: options, signal: params.signal })
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

type LoginWithWebAuthnQueryParams = {
  body: {
    clientId: string
    origin: string
    scope: string
    email?: string
    phoneNumber?: string
  }
  conditionalMediationAvailable: boolean
}
