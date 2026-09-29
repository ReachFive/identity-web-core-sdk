import type { Middleware } from '../transport'

/**
 * Supplies the id that ties a user's requests together in the server logs. How it is obtained and
 * persisted is platform-specific (the browser keeps it in `localStorage`), so it is injected.
 */
export type CorrelationIdProvider = () => string | undefined | Promise<string | undefined>

export function withCorrelationId(provider: CorrelationIdProvider): Middleware {
  return (next) => async (request) => {
    const correlationId = await provider()
    return next(
      correlationId ? { ...request, headers: { ...request.headers, 'X-R5-Correlation-Id': correlationId } } : request
    )
  }
}
