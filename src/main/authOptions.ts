import pick from 'lodash/pick'

import { AuthParameters } from './authParameters'
import { Scope } from './models'
import { resolveScope } from './scopeHelper'

export type ResponseType = 'code' | 'token'
export type Prompt = 'none' | 'login' | 'consent' | 'select_account'

/**
 * More infos here: https://developer.reach5.co/api/identity-web-legacy/#authentication-options
 */
export type AuthOptions = {
  responseType?: ResponseType
  redirectUri?: string
  scope?: Scope
  fetchBasicProfile?: boolean
  useWebMessage?: boolean
  popupMode?: boolean
  prompt?: Prompt
  origin?: string
  state?: string
  nonce?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  accessToken?: string
  requireRefreshToken?: boolean
  persistent?: boolean
}

/**
 * Transform authentication options into authentication parameters
 * @param opts
 *    Authentication options
 * @param acceptPopupMode
 *    Indicates if the popup mode is allowed (depends on the type of authentication or context)
 * @param defaultScopes
 *    Default scopes
 */
export function computeAuthOptions(
  opts: AuthOptions = {},
  { acceptPopupMode = false }: { acceptPopupMode?: boolean } = {},
  defaultScopes?: string
): AuthParameters {
  const isPopup = opts.popupMode && acceptPopupMode
  const responseType = opts.redirectUri ? 'code' : 'token'
  const responseMode = opts.useWebMessage && !isPopup ? 'web_message' : undefined
  const display = isPopup ? 'popup' : responseMode !== 'web_message' ? 'page' : undefined
  const prompt = responseMode === 'web_message' ? 'none' : opts.prompt
  const scope = resolveScope(opts, defaultScopes)

  return {
    responseType,
    ...pick(opts, [
      'responseType',
      'redirectUri',
      'origin',
      'state',
      'nonce',
      'providerScope',
      'idTokenHint',
      'loginHint',
      'accessToken',
      'persistent',
    ]),
    scope,
    display,
    responseMode,
    prompt,
  }
}
