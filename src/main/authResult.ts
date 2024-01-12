import { IdTokenPayload, parseJwtTokenPayload } from '../utils/jwt'
import { logError } from '../utils/logger'

export type TokenType = 'Bearer'

export interface AuthResult {
  accessToken?: string
  expiresIn?: number
  tokenType?: TokenType
  idToken?: string
  idTokenPayload?: IdTokenPayload
  code?: string
  state?: string
  refreshToken?: string
  stepUpToken?: string
  amr?: string[]
  providerName?: string
  providerAccessToken?: string
}

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
      logError('ID Token parsing error', e)
    }
  }
  return response
}

export namespace AuthResult {
  export function isAuthResult(thing: unknown): thing is AuthResult {
    return typeof thing === "object" && thing !== null 
      && ('accessToken' in thing || 'idToken' in thing || 'code' in thing)
  }
}
