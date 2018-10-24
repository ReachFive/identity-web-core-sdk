import * as v from 'validation.ts'
import { idTokenPayload } from '../lib/jwt'


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

export namespace AuthResult {

  export function isAuthResult(thing: any): thing is AuthResult {
    return thing && (thing.accessToken || thing.idToken)
  }

}