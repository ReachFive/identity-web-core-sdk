/**
 * @jest-environment node
 */
import { ApiError } from '../errors'
import {
  withBaseUrl,
  withBearerAuth,
  withCaseTransform,
  withCookies,
  withCorrelationId,
  withErrorMapping,
  withJsonBody,
  withLocaleHeaders
} from '../middleware'
import type { HttpRequest, HttpResponse, Transport } from '../transport'

/** A terminal transport that records what reached it and answers with `response`. */
function recorder(response: HttpResponse = { status: 200, body: {} }) {
  const seen: HttpRequest[] = []
  const transport: Transport = (req) => {
    seen.push(req)
    return Promise.resolve(response)
  }
  return { seen, transport }
}

const request = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  method: 'GET',
  url: '/identity/v1/userinfo',
  headers: {},
  ...overrides
})

describe('withBaseUrl', () => {
  test('prefixes the path and appends a snake-cased query string', async () => {
    const { seen, transport } = recorder()

    await withBaseUrl('https://local.reach5.net')(transport)(request({ query: { clientId: 'abc', fields: 'email' } }))

    expect(seen[0].url).toBe('https://local.reach5.net/identity/v1/userinfo?client_id=abc&fields=email')
    expect(seen[0].query).toBeUndefined()
  })

  test('leaves the path alone when there is no query', async () => {
    const { seen, transport } = recorder()

    await withBaseUrl('https://local.reach5.net')(transport)(request())

    expect(seen[0].url).toBe('https://local.reach5.net/identity/v1/userinfo')
  })

  test('does not treat an absolute URL as an escape hatch', async () => {
    const { seen, transport } = recorder()

    await withBaseUrl('https://local.reach5.net')(transport)(request({ url: 'https://elsewhere.test/x' }))

    expect(seen[0].url).toBe('https://local.reach5.nethttps://elsewhere.test/x')
  })
})

describe('withBearerAuth', () => {
  test('turns the access token into an Authorization header', async () => {
    const { seen, transport } = recorder()

    await withBearerAuth()(transport)(request({ accessToken: 'tkn' }))

    expect(seen[0].headers).toEqual({ Authorization: 'Bearer tkn' })
    expect(seen[0].accessToken).toBeUndefined()
  })

  test('adds nothing without a token', async () => {
    const { seen, transport } = recorder()

    await withBearerAuth()(transport)(request())

    expect(seen[0].headers).toEqual({})
  })
})

describe('withLocaleHeaders', () => {
  test('sends Accept-Language and Custom-Locale when configured', async () => {
    const { seen, transport } = recorder()

    await withLocaleHeaders({ language: 'fr', locale: 'fr-CA' })(transport)(request())

    expect(seen[0].headers).toEqual({ 'Accept-Language': 'fr', 'Custom-Locale': 'fr-CA' })
  })

  test('sends nothing when not configured', async () => {
    const { seen, transport } = recorder()

    await withLocaleHeaders({})(transport)(request())

    expect(seen[0].headers).toEqual({})
  })
})

describe('withCorrelationId', () => {
  test('asks the injected provider for an id on every request', async () => {
    const { seen, transport } = recorder()
    const provider = jest.fn().mockResolvedValue('corr-1')

    const send = withCorrelationId(provider)(transport)
    await send(request())
    await send(request())

    expect(provider).toHaveBeenCalledTimes(2)
    expect(seen[1].headers).toEqual({ 'X-R5-Correlation-Id': 'corr-1' })
  })

  test('sends no header when the provider has no id', async () => {
    const { seen, transport } = recorder()

    await withCorrelationId(() => undefined)(transport)(request())

    expect(seen[0].headers).toEqual({})
  })
})

describe('withJsonBody', () => {
  test('serialises the body and declares its content type', async () => {
    const { seen, transport } = recorder()

    await withJsonBody()(transport)(request({ method: 'POST', body: { a: 1 } }))

    expect(seen[0].body).toBe('{"a":1}')
    expect(seen[0].headers).toEqual({ 'Content-Type': 'application/json;charset=UTF-8' })
  })

  test('leaves a bodiless request untouched', async () => {
    const { seen, transport } = recorder()

    await withJsonBody()(transport)(request())

    expect(seen[0].body).toBeUndefined()
    expect(seen[0].headers).toEqual({})
  })
})

describe('withCaseTransform', () => {
  test('snake-cases the request body and camel-cases the response body', async () => {
    const { seen, transport } = recorder({ status: 200, body: { access_token: 'x' } })

    const response = await withCaseTransform()(transport)(request({ body: { clientId: 'abc' } }))

    expect(seen[0].body).toEqual({ client_id: 'abc' })
    expect(response.body).toEqual({ accessToken: 'x' })
  })

  test('leaves opaque subtrees such as custom_fields untouched', async () => {
    const { seen, transport } = recorder({ status: 200, body: { custom_fields: { my_field: 1 } } })

    const response = await withCaseTransform()(transport)(request({ body: { customFields: { myField: 1 } } }))

    expect(seen[0].body).toEqual({ custom_fields: { myField: 1 } })
    expect(response.body).toEqual({ customFields: { my_field: 1 } })
  })
})

describe('withCookies', () => {
  test('includes credentials when enabled', async () => {
    const { seen, transport } = recorder()

    await withCookies(true)(transport)(request())

    expect(seen[0].credentials).toBe('include')
  })

  test('does not when disabled', async () => {
    const { seen, transport } = recorder()

    await withCookies(false)(transport)(request())

    expect(seen[0].credentials).toBeUndefined()
  })
})

describe('withErrorMapping', () => {
  test('passes a 2xx response through', async () => {
    const { transport } = recorder({ status: 200, body: { ok: true } })

    await expect(withErrorMapping()(transport)(request())).resolves.toEqual({ status: 200, body: { ok: true } })
  })

  test('raises an ApiError that keeps the HTTP status', async () => {
    const body = { error: 'invalid_grant', errorDescription: 'Invalid email or password' }
    const { transport } = recorder({ status: 400, body })

    const error = await withErrorMapping()(transport)(request()).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, body, ...body, message: 'Invalid email or password' })
  })
})
