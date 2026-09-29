/**
 * @jest-environment node
 */
import { compose, createHttp } from '../pipeline'
import type { HttpRequest, Middleware, Transport } from '../transport'

describe('compose', () => {
  test('runs middlewares outermost first on the way in, and in reverse on the way out', async () => {
    const trace: string[] = []
    const tag =
      (name: string): Middleware =>
      (next) =>
      async (req) => {
        trace.push(`>${name}`)
        const res = await next(req)
        trace.push(`<${name}`)
        return res
      }
    const transport: Transport = () => {
      trace.push('transport')
      return Promise.resolve({ status: 200, body: undefined })
    }

    await compose(transport, [tag('a'), tag('b')])({ method: 'GET', url: '/', headers: {} })

    expect(trace).toEqual(['>a', '>b', 'transport', '<b', '<a'])
  })
})

describe('createHttp', () => {
  function capture() {
    const seen: HttpRequest[] = []
    const http = createHttp((req) => {
      seen.push(req)
      return Promise.resolve({ status: 200, body: { ok: true } })
    })
    return { seen, http }
  }

  test.each([
    ['get', 'GET'],
    ['post', 'POST'],
    ['put', 'PUT'],
    ['patch', 'PATCH'],
    ['delete', 'DELETE']
  ] as const)('%s sends a %s request', async (verb, method) => {
    const { seen, http } = capture()

    await http[verb]('/path', { accessToken: 'tkn' })

    expect(seen[0]).toEqual({ method, url: '/path', headers: {}, accessToken: 'tkn' })
  })

  test('resolves with the response body only', async () => {
    const { http } = capture()

    await expect(http.post('/path', { body: { a: 1 } })).resolves.toEqual({ ok: true })
  })
})
