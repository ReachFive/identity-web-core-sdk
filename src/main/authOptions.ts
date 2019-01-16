import * as v from 'validation.ts'
import uniq from 'lodash/uniq'
import pick from 'lodash/pick'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'

/**
 * Validator for authentication options.
 * More infos here: https://developer.reach5.co/api/identity-web-legacy/#authentication-options
 */
export const authOptions = v.object({
  responseType: v.optional(v.union('code', 'token')),
  redirectUri: v.optional(v.string),
  scope: v.optional(v.union(v.string, v.array(v.string))),
  fetchBasicProfile: v.optional(v.boolean),
  popupMode: v.optional(v.boolean),
  prompt: v.optional(v.string),
  origin: v.optional(v.string),
  state: v.optional(v.string),
  nonce: v.optional(v.string),
  providerScope: v.optional(v.string),
  idTokenHint: v.optional(v.string),
  loginHint: v.optional(v.string),
  accessToken: v.optional(v.string),
  requireRefreshToken: v.optional(v.boolean),
  acceptTos: v.optional(v.boolean)
})

export type AuthOptions = typeof authOptions.T

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
 * @param {AuthOptions} opts
 * @returns {string}
 */
export function resolveScope(opts: AuthOptions = {}): string {
  const fetchBasicProfile = isUndefined(opts.fetchBasicProfile) || opts.fetchBasicProfile
  return uniq([
    ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
    ...(opts.requireRefreshToken ? ['offline_access'] : []),
    ...parseScope(opts.scope),
  ]).join(' ')
}

/**
 * Transform authentication options into authentication parameters
 * @param {AuthOptions} opts
 *    Authentication options
 * @param {boolean} acceptPopupMode
 *    Indicates if the popup mode is allowed (depends on the type of authentication or context)
 * @returns {AuthParameters}
 */
export function prepareAuthOptions(opts: AuthOptions = {}, { acceptPopupMode = false }: { acceptPopupMode?: boolean } = {}): AuthParameters {
  return {
    responseType: opts.redirectUri ? 'code' : 'token',
    scope: resolveScope(opts),
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
      'acceptTos',
    ]),
  }
}

/**
 * Normalize the scope format (e.g. "openid email" => ["openid", "email"])
 * @param {string[] | string | undefined} scope
 *    Scope entered by the user
 * @returns {string[]}
 */
function parseScope(scope: string[] | string | undefined): string[] {
  if (isUndefined(scope)) return []
  if (isArray(scope)) return scope
  if (isString(scope)) return scope.split(' ')
  throw new Error('Invalid scope format: string or array expected.')
}
