import type { Middleware } from '../transport'

export function withJsonBody(): Middleware {
  return (next) => (request) =>
    request.body === undefined || request.body === null
      ? next({ ...request, body: undefined })
      : next({
          ...request,
          headers: { ...request.headers, 'Content-Type': 'application/json;charset=UTF-8' },
          body: JSON.stringify(request.body)
        })
}
