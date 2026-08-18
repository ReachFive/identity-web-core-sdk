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
  scope?: string
  socialProviders: string[]
  googleClientId?: string
  passwordPolicy: PasswordPolicy
  consents?: Consent[]
  customFields: CustomField[]
  resourceBaseUrl: string
  mfaSmsEnabled: boolean
  mfaEmailEnabled: boolean
  rbaEnabled: boolean
  isImplicitFlowForbidden: boolean
  loginTypeAllowed: LoginTypeAllowed
}
