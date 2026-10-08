import { ApiError } from '../errors'
import type { Middleware } from '../transport'

/** Turns any non-2xx response into an `ApiError`, keeping its status. */
export function withErrorMapping(): Middleware {
  return (next) => async (request) => {
    const response = await next(request)
    if (response.status < 200 || response.status >= 300) throw new ApiError(response.status, response.body)
    return response
  }
}
