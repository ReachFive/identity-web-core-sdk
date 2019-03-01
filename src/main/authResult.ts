import * as v from 'validation.ts'
import { idTokenPayload, parseJwtTokenPayload } from '../utils/jwt'
import { logError } from '../utils/logger'


export const authResult = v.object({
  accessToken: v.optional(v.string),
  expiresIn: v.optional(v.number),
  tokenType: v.optional(v.literal('Bearer')),
  idToken: v.optional(v.string),
  idTokenPayload: v.optional(idTokenPayload),
  code: v.optional(v.string),
  state: v.optional(v.string)
})

export type AuthResult = typeof authResult.T

/**
 * Parse the id token, if present, and add the payload to the AuthResult
 */
export function enrichAuthResult(response: AuthResult): AuthResult {
  if (response.idToken) {
    try {
      const idTokenPayload = parseJwtTokenPayload(response.idToken)
      return {
        ...response,
        idTokenPayload
      }
    } catch (e) {
      logError(`id token parsing error: ${e}`)
    }
  }
  return response
}

export namespace AuthResult {

  export function isAuthResult(thing: any): thing is AuthResult {
    return thing && (thing.accessToken || thing.idToken)
  }

}
