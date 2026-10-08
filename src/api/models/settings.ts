/**
 * Server-side account settings, fetched once at client creation.
 */
import type { Consent } from './consents'
import type { CustomField } from './customFields'
import type { PasswordPolicy } from './password'

export type LoginTypeAllowed = {
  email: boolean
  phoneNumber: boolean
  customIdentifier: boolean
}

export type Provider = {
  key: string
  name: string
  color: string
  btnBackgroundColor?: string
  btnBorderColor?: string
  btnTextColor?: string
  icon: string
  scope?: string[]
}

/**
 * A ReachFive account's configuration, returned by `GET /identity/v1/config`.
 *
 * Several of these fields gate behaviour at runtime rather than merely describing it: `sso` decides
 * whether requests send cookies, `isPublic` and `pkceEnforced` decide which OAuth flow is allowed,
 * and `scope` supplies the default scopes.
 */
export type RemoteSettings = {
  sso: boolean
  sms: boolean
  webAuthn: boolean
  language: string
  countryCode?: string
  pkceEnforced: boolean
  isPublic: boolean
  /** Whether PKCE is enabled for the client, even when not enforced. */
  pkceEnabled?: boolean
  /** The client's default scope, when one is set. */
  scope?: string
  socialProviders: string[]
  /** Keyed by the provider's configured name. Only when custom providers are configured. */
  customProviders?: Record<string, Provider>
  /** Only when the Google provider is configured. */
  googleClientId?: string
  /**
   * Absent when Registration as a Service (RaaS) is not enabled on the account. Typed as always present so as not to break
   * existing code in a minor release: check for it before use.
   */
  passwordPolicy: PasswordPolicy
  /** Only when the Consents feature is enabled on the account. */
  consents?: Consent[]
  customFields: CustomField[]
  /** Custom fields defined on addresses rather than on the profile. */
  addressFields?: CustomField[]
  resourceBaseUrl: string
  mfaSmsEnabled: boolean
  mfaEmailEnabled: boolean
  rbaEnabled: boolean
  isImplicitFlowForbidden: boolean
  loginTypeAllowed: LoginTypeAllowed
}
