import {AuthOptions, AuthParameters, computeAuthOptions} from './authOptions'
import {AuthResult, enrichAuthResult} from './authResult'
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
import {ApiClientConfig, ErrorResponse} from './main'
import { computePkceParams, PkceParams } from './pkceService'
import { resolveScope } from './authOptions'
import { toQueryString } from '../utils/queryString'
import pick from 'lodash/pick'
import { randomBase64String } from '../utils/random'
import { TokenRequestParameters } from './oAuthClient'
import { camelCaseProperties } from '../utils/transformObjectProperties'

// TODO SZA Copy-paste
type AuthenticationToken = { tkn: string }

/**
 * Identity Rest API Client
 */
export default class WebAuthnClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager
  // TODO SZA Copy-paste
  private authorizeUrl: string
  private tokenUrl: string

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager
    // TODO SZA Copy-paste
    this.authorizeUrl = `https://${this.config.domain}/oauth/authorize`
    this.tokenUrl = `https://${this.config.domain}/oauth/token`
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

  // TODO SZA Copy-paste
  private resolveScope(opts: AuthOptions = {}) {
    return resolveScope(opts, this.config.scope)
  }

  private loginCallback(tkn: AuthenticationToken, auth: AuthOptions = {}): Promise<AuthResult> {
    const authParams = this.authParams(auth)

    return this.getPkceParams(authParams).then(maybeChallenge => {
      const queryString = toQueryString({
        ...authParams,
        ...maybeChallenge,
        ...pick(tkn, 'tkn')
      })

      if (auth.useWebMessage) {
        return this.getWebMessage(
            `${this.authorizeUrl}?${queryString}`,
            `https://${this.config.domain}`,
            auth.redirectUri,
        )
      } else {
        return this.redirect(`${this.authorizeUrl}?${queryString}`) as AuthResult
      }
    })
  }

  private authParams(opts: AuthOptions, { acceptPopupMode = false } = {}) {
    const isConfidentialCodeWebMsg = !this.config.isPublic && !!opts.useWebMessage && (opts.responseType === 'code' || opts.redirectUri)

    const overrideResponseType: Partial<AuthOptions> = isConfidentialCodeWebMsg
        ? { responseType: 'token', redirectUri: undefined }
        : {}

    return {
      clientId: this.config.clientId,
      ...computeAuthOptions(
          {
            ...opts,
            ...overrideResponseType
          },
          { acceptPopupMode },
          this.config.scope
      )
    }
  }

  private getPkceParams(authParams: AuthParameters): Promise<PkceParams | {}> {
    if (this.config.isPublic && authParams.responseType === 'code')
      return computePkceParams()
    else if (authParams.responseType === 'token' && this.config.pkceEnforced)
      return Promise.reject(new Error('Cannot use implicit flow when PKCE is enforced'))
    else
      return Promise.resolve({})
  }

  private getWebMessage(
      src: string,
      origin: string,
      redirectUri?: string,
  ): Promise<AuthResult> {
    const iframe = document.createElement('iframe')
    // "wm" needed to make sure the randomized id is valid
    const id = `wm${randomBase64String()}`
    iframe.setAttribute('width', '0')
    iframe.setAttribute('height', '0')
    iframe.setAttribute('style', 'display:none;')
    iframe.setAttribute('id', id)
    iframe.setAttribute('src', src)

    return new Promise<AuthResult>((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        // Verify the event's origin
        if (event.origin !== origin) return

        // Verify the event's syntax
        const data = camelCaseProperties(event.data)
        if (data.type !== 'authorization_response') return

        // The iframe is no longer needed, clean it up ..
        if (window.document.body.contains(iframe)) {
          window.document.body.removeChild(iframe)
        }

        const result = data.response

        if (AuthResult.isAuthResult(result)) {
          if (result.code) {
            resolve(this.exchangeAuthorizationCodeWithPkce({
              code: result.code,
              redirectUri: redirectUri || window.location.origin,
            }))
          } else {
            this.eventManager.fireEvent('authenticated', data.response)
            resolve(enrichAuthResult(data.response))
          }
        } else if (ErrorResponse.isErrorResponse(result)) {
          // The 'authentication_failed' event must not be triggered because it is not a real authentication failure.
          reject(result)
        } else {
          reject({
            error: 'unexpected_error',
            errorDescription: 'Unexpected error occurred'
          })
        }
        window.removeEventListener('message', listener, false)
      }

      window.addEventListener('message', listener, false)
      document.body.appendChild(iframe)
    })
  }

  private exchangeAuthorizationCodeWithPkce(params: TokenRequestParameters): Promise<AuthResult> {
    return this.http
        .post<AuthResult>(this.tokenUrl, {
          body: {
            clientId: this.config.clientId,
            grantType: 'authorization_code',
            codeVerifier: sessionStorage.getItem('verifier_key'),
            ...params
          }
        })
        .then(authResult => {
          this.eventManager.fireEvent('authenticated', authResult)
          return enrichAuthResult(authResult)
        })
  }

  private redirect(location: string): Promise<void> {
    window.location.assign(location)
    return Promise.resolve()
  }
}
