import { ApiError } from '../api/http/errors'
import {
  withBaseUrl,
  withBearerAuth,
  withCaseTransform,
  withCookies,
  withCorrelationId,
  withErrorMapping,
  withJsonBody,
  withLocaleHeaders
} from '../api/http/middleware'
import type { Http } from '../api/http/pipeline'
import { compose, createHttp } from '../api/http/pipeline'
import type { Middleware } from '../api/http/transport'
import { fetchTransport } from '../api/http/transport'

export type BrowserHttpConfig = {
  /** Domain root, e.g. `https://local.reach5.net`. */
  baseUrl: string
  /** Sent as `Accept-Language`. */
  language?: string
  /** Sent as `Custom-Locale`. */
  locale?: string
  /** Sends cookies with every request (SSO). */
  acceptCookies?: boolean
}

/**
 * The HTTP client behind `createClient()`: the isomorphic pipeline, plus the two things that are
 * specific to the browser SDK — the correlation id kept in `localStorage`, and the historical error
 * contract.
 */
export function createBrowserHttp(config: BrowserHttpConfig): Http {
  return createHttp(
    compose(fetchTransport(), [
      withLegacyErrorShape(),
      withErrorMapping(),
      withCaseTransform(),
      withBaseUrl(config.baseUrl),
      withBearerAuth(),
      withLocaleHeaders(config),
      withJsonBody(),
      withCorrelationId(retrieveCorrelationId),
      withCookies(!!config.acceptCookies)
    ])
  )
}

/**
 * The `/identity/v1/config` bootstrap. It goes out bare, as it always has: no locale, no correlation
 * id, no cookies.
 */
export function createBootstrapHttp(baseUrl: string): Http {
  return createHttp(
    compose(fetchTransport(), [withLegacyErrorShape(), withErrorMapping(), withCaseTransform(), withBaseUrl(baseUrl)])
  )
}

/**
 * `createClient()` has always rejected API errors with the camel-cased JSON body itself, not an
 * `Error`, and its consumers compare that object structurally. An `ApiError` would not compare equal,
 * so for this public surface the body is unwrapped again. `ApiError` is what the isomorphic API layer
 * exposes.
 *
 * A body that is not JSON has no historical shape to restore — it used to surface as a `SyntaxError` —
 * so it is left as the `ApiError`, which at least carries the status. The same goes for a JSON body
 * that is not an object (`null`, a bare string): the API never sends one, its error bodies are always
 * objects.
 */
function withLegacyErrorShape(): Middleware {
  return (next) => (request) =>
    next(request).catch((error: unknown) =>
      Promise.reject(
        error instanceof ApiError && typeof error.body === 'object' && error.body !== null ? error.body : error
      )
    )
}

export async function retrieveCorrelationId() {
  const correlationId = window?.localStorage?.getItem('correlationId')
  if (correlationId) {
    return correlationId
  }
  const newCorrelationId = window.crypto.randomUUID()
  window?.localStorage?.setItem('correlationId', newCorrelationId)
  return newCorrelationId
}
