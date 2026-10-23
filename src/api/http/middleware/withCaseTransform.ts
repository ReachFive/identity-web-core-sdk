import { camelCaseProperties, snakeCaseProperties } from '../../../utils/transformObjectProperties'
import type { Middleware } from '../transport'

/**
 * The SDK speaks camelCase, the API speaks snake_case: request bodies are snake-cased on the way out
 * and every response body — errors included — is camel-cased on the way in.
 */
export function withCaseTransform(): Middleware {
  return (next) => async (request) => {
    const response = await next(
      request.body === undefined ? request : { ...request, body: snakeCaseProperties(request.body) }
    )
    return { ...response, body: camelCaseProperties(response.body) }
  }
}
