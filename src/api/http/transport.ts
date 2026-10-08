import type { QueryString } from '../../utils/queryString'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * A request as it travels down the pipeline. Middlewares refine it step by step: `url` starts as a
 * path and `withBaseUrl` makes it absolute, `body` starts as an object and `withJsonBody` serialises
 * it, `accessToken` becomes an `Authorization` header in `withBearerAuth`. What reaches the transport
 * is ready to go on the wire.
 */
export type HttpRequest = {
  method: HttpMethod
  url: string
  headers: Record<string, string>
  query?: QueryString
  body?: unknown
  accessToken?: string
  credentials?: 'include'
}

/**
 * `body` is the decoded JSON payload, `undefined` for a 204, or — for an error response whose body is
 * not JSON, such as a proxy's HTML page — the raw text.
 */
export type HttpResponse = {
  status: number
  body: unknown
}

export type Transport = (request: HttpRequest) => Promise<HttpResponse>

export type Middleware = (next: Transport) => Transport

// Structural stand-ins for the fetch API. This layer is compiled without the DOM lib (see
// tsconfig.api.json), so it describes only the part of fetch it relies on. Browsers, Node 18+ and
// jest-fetch-mock all satisfy it.
type FetchInit = {
  method: HttpMethod
  headers: Record<string, string>
  body?: string
  credentials?: 'include'
}
type FetchResponse = { status: number; ok: boolean; text(): Promise<string> }
export type Fetch = (url: string, init?: FetchInit) => Promise<FetchResponse>

/**
 * The default transport. Without an explicit `fetch`, the global one is looked up on every call rather
 * than captured at creation, so a polyfill or a test mock installed later is still honoured.
 */
export function fetchTransport(fetchImpl?: Fetch): Transport {
  return async (request) => {
    const fetch = fetchImpl ?? (globalThis as { fetch?: Fetch }).fetch
    if (!fetch) throw new Error('No fetch implementation available: pass one to fetchTransport()')

    const response = await fetch(request.url, toFetchInit(request))
    if (response.status === 204) return { status: response.status, body: undefined }

    const text = await response.text()
    // A success must be JSON: failing loudly here is the historical behaviour. An error body, though,
    // is kept even when it is not JSON, so that the caller learns the status instead of a SyntaxError.
    return { status: response.status, body: response.ok ? JSON.parse(text) : parseLenient(text) }
  }
}

function toFetchInit({ method, headers, body, credentials }: HttpRequest): FetchInit | undefined {
  if (body !== undefined && typeof body !== 'string') {
    throw new TypeError('fetchTransport only sends string bodies: add withJsonBody() to the pipeline')
  }
  // A bare GET needs no init: fetch's defaults already describe it, and it is what the `/config`
  // bootstrap has always sent.
  if (method === 'GET' && Object.keys(headers).length === 0 && body === undefined && !credentials) return undefined

  return {
    method,
    headers,
    ...(credentials && { credentials }),
    ...(body !== undefined && { body })
  }
}

function parseLenient(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
