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
  birthdate?: string
  profileURL?: string
  picture?: string
  username?: string
  gender?: string
  addresses?: ProfileAddress[]
  locale?: string
  bio?: string
  customFields?: Record<string, unknown>
  consents?: Record<string, unknown>
  company?: string
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
  preferredUsername?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  emailVerified?: boolean
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  address?: ProfileAddress[]
  updatedAt?: number
  customFields?: Record<string, unknown>
}
