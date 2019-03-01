import * as v from 'validation.ts'
import { camelCaseProperties } from './transformObjectProperties'
import { decodeBase64UrlSafe } from './base64'


export const idTokenPayload = v.object({
  authType: v.optional(v.string),
  birthdate: v.optional(v.string),
  email: v.optional(v.string),
  emailVerified: v.optional(v.boolean),
  exp: v.optional(v.number),
  familyName: v.optional(v.string),
  gender: v.union('female', 'male', 'other'),
  givenName: v.optional(v.string),
  iat: v.optional(v.number),
  iss: v.optional(v.string),
  locale: v.optional(v.string),
  name: v.optional(v.string),
  newUser: v.optional(v.boolean),
  picture: v.optional(v.string),
  profile: v.optional(v.string),
  sub: v.optional(v.string),
  updatedAt: v.optional(v.string)
})

export type IdTokenPayload = typeof idTokenPayload.T

export function parseJwtTokenPayload(token: string): IdTokenPayload {
  const bodyPart = token.split('.')[1]
  return camelCaseProperties(JSON.parse(decodeBase64UrlSafe(bodyPart))) as IdTokenPayload
}
