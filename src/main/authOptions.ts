import uniq from 'lodash/uniq'
import pick from 'lodash/pick'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'

export type AuthOptionsResponseType = 'code' | 'token'

/**
 * More infos here: https://developer.reach5.co/api/identity-web-legacy/#authentication-options
 */
export interface AuthOptions {
  responseType?: AuthOptionsResponseType
  redirectUri?: string
  scope?: string | string[]
  fetchBasicProfile?: boolean
  popupMode?: boolean
  prompt?: string
  origin?: string
  state?: string
  nonce?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  accessToken?: string
  requireRefreshToken?: boolean
  acceptTos?: boolean
}

/**
 * This type represents the parameters that are actually sent to the HTTP API
 */
type AuthParameters = {
  responseType: 'code' | 'token'
  scope: string
  display: string
  redirectUri?: string
  prompt?: string
  origin?: string
  state?: string
  nonce?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  accessToken?: string
  acceptTos?: boolean
}

/**
 * Resolve the actual oauth2 scope according to the authentication options.
 */
export function resolveScope(opts: AuthOptions = {}, defaultScopes: string | undefined): string {
  const fetchBasicProfile = isUndefined(opts.fetchBasicProfile) || opts.fetchBasicProfile
  const scopes = isUndefined(opts.scope) ? defaultScopes : opts.scope
  return uniq([
    ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
    ...(opts.requireRefreshToken ? ['offline_access'] : []),
    ...parseScope(scopes)
  ]).join(' ')
}

/**
 * Transform authentication options into authentication parameters
 * @param opts
 *    Authentication options
 * @param acceptPopupMode
 *    Indicates if the popup mode is allowed (depends on the type of authentication or context)
 */
export function prepareAuthOptions(
  opts: AuthOptions = {},
  { acceptPopupMode = false }: { acceptPopupMode?: boolean } = {},
  defaultScopes: string | undefined
): AuthParameters {
  return {
    responseType: opts.redirectUri ? 'code' : 'token',
    scope: resolveScope(opts, defaultScopes),
    display: opts.popupMode && acceptPopupMode ? 'popup' : 'page',
    ...pick(opts, [
      'responseType',
      'redirectUri',
      'prompt',
      'origin',
      'state',
      'nonce',
      'providerScope',
      'idTokenHint',
      'loginHint',
      'accessToken',
      'acceptTos'
    ])
  }
}

/**
 * Normalize the scope format (e.g. "openid email" => ["openid", "email"])
 * @param scope Scope entered by the user
 */
function parseScope(scope: string[] | string | undefined): string[] {
  if (isUndefined(scope)) return []
  if (isArray(scope)) return scope
  if (isString(scope)) return scope.split(' ')
  throw new Error('Invalid scope format: string or array expected.')
}
