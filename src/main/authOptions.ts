import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import pick from 'lodash/pick'
import uniq from 'lodash/uniq'

import { Scope } from './models'

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

type ResponseMode = 'web_message'
type Display = 'page' | 'popup' | 'touch' | 'wap'

/**
 * This type represents the parameters that are actually sent to the HTTP API
 */
export type AuthParameters = {
  responseType: ResponseType
  responseMode?: ResponseMode
  scope: string
  display?: Display
  redirectUri?: string
  prompt?: Prompt
  origin?: string
  state?: string
  nonce?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  accessToken?: string
  persistent?: boolean
}

/**
 * Resolve the actual oauth2 scope according to the authentication options.
 */
export function resolveScope(opts: AuthOptions = {}, defaultScopes?: string): string {
  const fetchBasicProfile = isUndefined(opts.fetchBasicProfile) || opts.fetchBasicProfile
  const scopes = opts.scope || defaultScopes
  return uniq([
    ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
    ...(opts.requireRefreshToken ? ['offline_access'] : []),
    ...parseScope(scopes),
  ]).join(' ')
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

/**
 * Normalize the scope format (e.g. "openid email" => ["openid", "email"])
 * @param scope Scope entered by the user
 */
function parseScope(scope?: string[] | string): string[] {
  if (isUndefined(scope)) return []
  if (isArray(scope)) return scope
  if (isString(scope)) return scope.split(' ')
  throw new Error('Invalid scope format: string or array expected.')
}
