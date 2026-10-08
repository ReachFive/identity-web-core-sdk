import { pick } from '../utils/utils'
import type { AuthParameters } from './authParameters'
import type { Scope } from '../api/models'
import type { WithPkceParams } from './pkceService'
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
  /** One value, or several, sent space-separated. */
  prompt?: Prompt | Prompt[]
  origin?: string
  state?: string
  nonce?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  /** Only sent on a social login, where it links the provider to the signed-in user. */
  accessToken?: string
  requireRefreshToken?: boolean
  persistent?: boolean
  /** Maximum age of the user's authentication, in seconds, beyond which they must log in again. */
  maxAge?: number
  /** Preferred languages for the pages shown to the user, as space-separated BCP 47 tags. */
  uiLocales?: string
  /** Requested authentication context class references, space-separated. */
  acrValues?: string
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
  opts: WithPkceParams<AuthOptions> = {},
  { acceptPopupMode = false }: { acceptPopupMode?: boolean } = {},
  defaultScopes?: string
): WithPkceParams<AuthParameters> {
  const isPopup = opts.popupMode && acceptPopupMode
  const responseType = opts.redirectUri ? 'code' : 'token'
  const responseMode = opts.useWebMessage && !isPopup ? 'web_message' : undefined
  const display = isPopup ? 'popup' : responseMode !== 'web_message' ? 'page' : undefined
  const prompt =
    responseMode === 'web_message'
      ? 'none'
      : Array.isArray(opts.prompt)
        ? opts.prompt.join(' ') || undefined
        : opts.prompt
  const scope = resolveScope(opts, defaultScopes)

  return {
    responseType,
    ...pick(
      opts,
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
      'codeChallenge',
      'codeChallengeMethod',
      'maxAge',
      'uiLocales',
      'acrValues'
    ),
    scope,
    display,
    responseMode,
    prompt
  }
}
