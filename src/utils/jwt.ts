import { camelCaseProperties } from './transformObjectProperties'
import { decodeBase64UrlSafe } from './base64'

export type Gender = 'female' | 'male' | 'other'

export type Address = {
  formatted?: string
  streetAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
}

export interface IdTokenPayload {
  acr?: string
  address?: Address
  amr?: string[]
  atHash?: string
  aud?: string[]
  authTime?: number
  authType?: string
  azp?: string
  birthdate?: string
  customFields?: Record<string, unknown>
  customIdentifier?: string
  email?: string
  emailVerified?: boolean
  exp?: number
  externalId?: string
  familyName?: string
  gender?: Gender
  givenName?: string
  iat?: number
  iss?: string
  locale?: string
  middleName?: string
  name?: string
  newUser?: boolean
  nickname?: string
  nonce?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  picture?: string
  preferredUsername?: string
  profile?: string
  sub?: string
  updatedAt?: string
}

export function parseJwtTokenPayload(token: string): IdTokenPayload {
  const bodyPart = token.split('.')[1]
  return camelCaseProperties(JSON.parse(decodeBase64UrlSafe(bodyPart))) as IdTokenPayload
}
