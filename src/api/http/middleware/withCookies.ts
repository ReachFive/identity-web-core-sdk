import type { Middleware } from '../transport'

/** Sends cookies along with each request — needed when SSO is enabled. */
export function withCookies(enabled: boolean): Middleware {
  return (next) => (request) => next(enabled ? { ...request, credentials: 'include' } : request)
}
