/**
 * Payloads for the signup endpoints, and the OpenID view of a user.
 */
import type { ProfileAddress } from './profile'

export type SignupProfileData = {
  email?: string
  phoneNumber?: string
  givenName?: string
  middleName?: string
  familyName?: string
  name?: string
  nickname?: string
  /** `YYYY-MM-DD`. */
  birthdate?: string
  /** @deprecated Not read by the API on signup. */
  profileURL?: string
  picture?: string
  username?: string
  gender?: string
  addresses?: ProfileAddress[]
  locale?: string
  /** @deprecated Not read by the API on signup. */
  bio?: string
  customFields?: Record<string, unknown>
  consents?: Record<string, unknown>
  company?: string
  /** @deprecated Not read by the API on signup. */
  liteOnly?: boolean
  customIdentifier?: string
}

export type SignupProfile = SignupProfileData & { password: string }

export type OpenIdUser = {
  sub: string
  name?: string
  givenName?: string
  familyName?: string
  middleName?: string
  nickname?: string
  /** @deprecated Never returned by the API. */
  preferredUsername?: string
  profile?: string
  picture?: string
  /** @deprecated Never returned by the API. */
  website?: string
  email?: string
  emailVerified?: boolean
  gender?: string
  birthdate?: string
  /** @deprecated Never returned by the API. */
  zoneinfo?: string
  locale?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  /** The profile's first address. */
  address?: OpenIdAddress
  addresses?: OpenIdAddress[]
  /** ISO 8601 date-time. */
  updatedAt?: string
  externalId?: string
  /** Only the custom fields whose read scope the client is configured with. */
  customFields?: Record<string, unknown>
}

/** An address in the OpenID Connect format. */
export type OpenIdAddress = {
  formatted?: string
  streetAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
}
