import type { Middleware } from '../transport'

export function withBearerAuth(): Middleware {
  return (next) =>
    ({ accessToken, ...request }) =>
      next(
        accessToken ? { ...request, headers: { ...request.headers, Authorization: `Bearer ${accessToken}` } } : request
      )
}
