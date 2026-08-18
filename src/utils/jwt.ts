import { decodeJwt } from 'jose'

import { camelCaseProperties } from './transformObjectProperties'

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

/**
 * Reads an id token's claims. The signature is NOT verified — callers only use this to surface
 * the payload alongside the tokens the authorization server just handed us over a trusted channel.
 */
export function parseJwtTokenPayload(token: string): IdTokenPayload {
  return camelCaseProperties(decodeJwt(token)) as IdTokenPayload
}
