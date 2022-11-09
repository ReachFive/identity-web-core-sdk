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
  export function isAuthResult(thing: any): thing is AuthResult {
    return thing && (thing.accessToken || thing.idToken || thing.code)
  }
}
