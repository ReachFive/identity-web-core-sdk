import { decodeJwt, type JWTPayload } from 'jose'

import { camelCaseProperties } from './transformObjectProperties'

export type Gender = 'female' | 'male' | 'other'

/** The OIDC `address` claim. Distinct from `ProfileAddress`, which models a stored profile. */
export type IdTokenAddress = {
  formatted?: string
  streetAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
}

/**
 * The JWT claims registered by RFC 7519, sourced from jose so the two cannot drift.
 *
 * Only the registered claims are inherited, deliberately not `JWTPayload` wholesale: that interface
 * carries an index signature, and inheriting it would turn every mistyped claim access into a silent
 * `unknown` instead of a compile error — a poor trade on a type consumers read constantly. Custom
 * claims remain reachable with an explicit cast, which is also more honest about what is going on.
 *
 * Picking these names is sound despite the snake_case-to-camelCase conversion applied to every
 * response, because each registered claim is a single word and so survives that conversion
 * unchanged. The names declared below are the converted forms: the wire carries `given_name`,
 * `email_verified`, `at_hash` and so on.
 */
type RegisteredJwtClaims = Pick<JWTPayload, 'iss' | 'sub' | 'aud' | 'jti' | 'nbf' | 'exp' | 'iat'>

/**
 * An id token's claims, as exposed by the SDK.
 */
export interface IdTokenPayload extends RegisteredJwtClaims {
  acr?: string
  address?: IdTokenAddress
  amr?: string[]
  atHash?: string
  // Narrower than `JWTPayload['aud']`, which allows a bare string. Kept as-is to avoid changing a
  // published type; worth revisiting, since a single-audience token would be mistyped here.
  aud?: string[]
  authTime?: number
  authType?: string
  azp?: string
  birthdate?: string
  customFields?: Record<string, unknown>
  customIdentifier?: string
  email?: string
  emailVerified?: boolean
  externalId?: string
  familyName?: string
  gender?: Gender
  givenName?: string
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
  updatedAt?: string
}

/**
 * Reads an id token's claims. The signature is NOT verified — callers only use this to surface the
 * payload alongside the tokens the authorization server just handed us over a trusted channel.
 *
 * Note this deliberately does not use `decodeJwt<IdTokenPayload>`: that generic describes what
 * `decodeJwt` returns, which is the raw claims set still in snake_case. `IdTokenPayload` describes
 * the shape *after* `camelCaseProperties`, so applying it to the intermediate value would assert
 * that `givenName` exists on an object that only has `given_name`.
 */
export function parseJwtTokenPayload(token: string): IdTokenPayload {
  return camelCaseProperties(decodeJwt(token)) as IdTokenPayload
}
