import { camelCaseProperties } from './transformObjectProperties'
import { decodeBase64UrlSafe } from './base64'

export type Gender = 'female' | 'male' | 'other'

export interface IdTokenPayload {
  authType?: string
  birthdate?: string
  email?: string
  emailVerified?: boolean
  exp?: number
  familyName?: string
  gender: Gender
  givenName?: string
  iat?: number
  iss?: string
  locale?: string
  name?: string
  newUser?: boolean
  picture?: string
  profile?: string
  sub?: string
  updatedAt?: string
}

export function parseJwtTokenPayload(token: string): IdTokenPayload {
  const bodyPart = token.split('.')[1]
  return camelCaseProperties(JSON.parse(decodeBase64UrlSafe(bodyPart))) as IdTokenPayload
}
