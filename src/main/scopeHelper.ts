import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import uniq from 'lodash/uniq'

import { AuthOptions } from './authOptions'

/**
 * Resolve the actual oauth2 scope according to the authentication options.
 */
export function resolveScope(opts: AuthOptions = {}, defaultScopes?: string): string {
  const fetchBasicProfile = isUndefined(opts.fetchBasicProfile) || opts.fetchBasicProfile
  const scopes = isUndefined(opts.scope) ? defaultScopes : opts.scope
  return uniq([
    ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
    ...(opts.requireRefreshToken ? ['offline_access'] : []),
    ...parseScope(scopes),
  ]).join(' ')
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
