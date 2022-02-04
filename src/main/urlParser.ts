import { parseQueryString } from '../utils/queryString'
import { AuthResult } from './authResult'
import { IdentityEventManager } from './identityEventManager'
import { ErrorResponse } from './models'

export type UrlParser = {
  /**
   * Check if the URL fragment contains an authentication response (either success with parameters like `id_token`
   * or `access_token`, or error with parameters like `error`)
   *
   * If a response is detected, trigger the corresponding event.
   *
   * @returns `true` if a response is detected
   */
  checkUrlFragment(url: string): boolean

  /**
   * Parse the URL fragment, and return the corresponding authentication response if exists.
   */
  parseUrlFragment(url?: string): AuthResult | ErrorResponse | undefined
}

export default function createUrlParser(eventManager: IdentityEventManager): UrlParser {
  return {
    checkUrlFragment(url: string): boolean {
      const authResult = this.parseUrlFragment(url)

      if (AuthResult.isAuthResult(authResult)) {
        eventManager.fireEvent('authenticated', authResult)
        return true
      } else if (ErrorResponse.isErrorResponse(authResult)) {
        eventManager.fireEvent('authentication_failed', authResult)
        return true
      }
      return false
    },

    parseUrlFragment(url = ''): AuthResult | ErrorResponse | undefined {
      const separatorIndex = url.indexOf('#')

      if (separatorIndex >= 0) {
        const parsed = parseQueryString(url.substr(separatorIndex + 1))

        const expiresIn = parsed.expiresIn ? parseInt(parsed.expiresIn, 10) : undefined

        if (AuthResult.isAuthResult(parsed)) {
          return {
            ...parsed,
            expiresIn,
          }
        }

        return ErrorResponse.isErrorResponse(parsed) ? parsed : undefined
      }

      return undefined
    },
  }
}
