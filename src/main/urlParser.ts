import { AuthResult } from './authResult'
import { parseQueryString } from '../lib/queryString'
import { ErrorResponse } from '../shared/model'
import { IdentityEventManager } from './identityEventManager'

export type UrlParser = {
  parseUrlFragment(url: string): boolean
  checkFragment(url?: string): (AuthResult | ErrorResponse | undefined)
}

export default function createUrlParser(eventManager: IdentityEventManager): UrlParser {
  return {
    parseUrlFragment(url: string): boolean {
      const authResult = this.checkFragment(url)

      if (AuthResult.isAuthResult(authResult)) {
        eventManager.fireEvent('authenticated', authResult)
        return true
      }
      else if (ErrorResponse.isErrorResponse(authResult)) {
        eventManager.fireEvent('authentication_failed', authResult)
        return true
      }
      return false
    },

    checkFragment(url: string = ''): AuthResult | ErrorResponse | undefined {
      const separatorIndex = url.indexOf('#')

      if (separatorIndex >= 0) {
        const parsed = parseQueryString(url.substr(separatorIndex + 1))

        const expiresIn = parsed.expiresIn
          ? parseInt(parsed.expiresIn)
          : undefined

        if (AuthResult.isAuthResult(parsed)) {
          return {
            ...parsed,
            expiresIn
          }
        }

        return ErrorResponse.isErrorResponse(parsed)
          ? parsed
          : undefined
      }

      return undefined
    }
  }
}