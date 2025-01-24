import { AuthOptions } from './authOptions'

/**
 * Resolve the actual oauth2 scope according to the authentication options.
 */
export function resolveScope(opts: AuthOptions = {}, defaultScopes?: string): string {
  const fetchBasicProfile = typeof opts.fetchBasicProfile === 'undefined' || opts.fetchBasicProfile
  const scopes = typeof opts.scope === 'undefined' ? defaultScopes : opts.scope
  return [...new Set([
    ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
    ...(opts.requireRefreshToken ? ['offline_access'] : []),
    ...parseScope(scopes)
  ])].join(' ')
}

/**
 * Normalize the scope format (e.g. "openid email" => ["openid", "email"])
 * @param scope Scope entered by the user
 */
function parseScope(scope: string[] | string | undefined): string[] {
  if (typeof scope === 'undefined') return []
  if (Array.isArray(scope)) return scope
  if (typeof scope === 'string') return scope.split(' ')
  throw new Error('Invalid scope format: string or array expected.')
}

