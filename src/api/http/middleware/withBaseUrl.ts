import { toQueryString } from '../../../utils/queryString'
import { isEmpty } from '../../../utils/utils'
import type { Middleware } from '../transport'

/**
 * Makes the request path absolute and appends its query, snake-casing the keys.
 *
 * Every path is resolved against `baseUrl`. There is deliberately no escape hatch for absolute URLs:
 * endpoints outside `/identity/v1` (such as `/oauth/token`) simply use a path from the domain root.
 */
export function withBaseUrl(baseUrl: string): Middleware {
  return (next) =>
    ({ query, ...request }) =>
      next({ ...request, url: baseUrl + request.url + (query && !isEmpty(query) ? `?${toQueryString(query)}` : '') })
}
