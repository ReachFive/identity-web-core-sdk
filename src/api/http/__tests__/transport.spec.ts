/**
 * @jest-environment node
 */
import { fetchTransport } from '../transport'
import type { HttpRequest } from '../transport'

function fakeFetch(status: number, text = '') {
  return jest.fn().mockResolvedValue({ status, ok: status >= 200 && status < 300, text: () => Promise.resolve(text) })
}

const request = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  method: 'GET',
  url: 'https://local.reach5.net/identity/v1/userinfo',
  headers: {},
  ...overrides
})

describe('fetchTransport', () => {
  test('sends method, headers, body and credentials', async () => {
    const fetch = fakeFetch(200, '{"ok":true}')
    const headers = { 'Content-Type': 'application/json;charset=UTF-8' }

    await fetchTransport(fetch)(request({ method: 'POST', headers, body: '{"a":1}', credentials: 'include' }))

    expect(fetch).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/userinfo', {
      method: 'POST',
      headers,
      body: '{"a":1}',
      credentials: 'include'
    })
  })

  test('sends a bare GET with no init at all', async () => {
    const fetch = fakeFetch(200, '{}')

    await fetchTransport(fetch)(request())

    expect(fetch).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/userinfo', undefined)
  })

  test('still sends an init for a GET that carries headers', async () => {
    const fetch = fakeFetch(200, '{}')

    await fetchTransport(fetch)(request({ headers: { 'Accept-Language': 'en' } }))

    expect(fetch).toHaveBeenCalledWith(expect.any(String), { method: 'GET', headers: { 'Accept-Language': 'en' } })
  })

  test('parses a JSON body and keeps the status', async () => {
    const response = await fetchTransport(fakeFetch(201, '{"id":"x"}'))(request())

    expect(response).toEqual({ status: 201, body: { id: 'x' } })
  })

  test('returns no body for a 204', async () => {
    const response = await fetchTransport(fakeFetch(204))(request())

    expect(response).toEqual({ status: 204, body: undefined })
  })

  test('keeps the raw text of a non-JSON error body instead of throwing a SyntaxError', async () => {
    const response = await fetchTransport(fakeFetch(502, '<html>Bad Gateway</html>'))(request())

    expect(response).toEqual({ status: 502, body: '<html>Bad Gateway</html>' })
  })

  test('rejects a non-JSON success body, as before', async () => {
    await expect(fetchTransport(fakeFetch(200, 'not json'))(request())).rejects.toThrow(SyntaxError)
  })

  test('refuses a body that was not serialised first', async () => {
    await expect(fetchTransport(fakeFetch(200, '{}'))(request({ method: 'POST', body: { a: 1 } }))).rejects.toThrow(
      TypeError
    )
  })

  test('resolves the global fetch at call time, so it can be replaced after creation', async () => {
    const transport = fetchTransport()
    const original = globalThis.fetch
    const replacement = fakeFetch(200, '{"late":true}')
    globalThis.fetch = replacement
    try {
      await expect(transport(request())).resolves.toEqual({ status: 200, body: { late: true } })
      expect(replacement).toHaveBeenCalled()
    } finally {
      globalThis.fetch = original
    }
  })
})
