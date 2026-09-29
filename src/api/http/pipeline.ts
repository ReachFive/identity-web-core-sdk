import type { QueryString } from '../../utils/queryString'
import type { HttpMethod, Middleware, Transport } from './transport'

/**
 * Wraps `transport` in `middlewares`. The first middleware is the outermost: it sees the request
 * first and the response last.
 */
export function compose(transport: Transport, middlewares: Middleware[]): Transport {
  return middlewares.reduceRight<Transport>((next, middleware) => middleware(next), transport)
}

export type RequestOptions = {
  query?: QueryString
  body?: unknown
  accessToken?: string
}

export interface Http {
  request<Data>(method: HttpMethod, path: string, options?: RequestOptions): Promise<Data>
  get<Data>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<Data>
  post<Data>(path: string, options?: RequestOptions): Promise<Data>
  put<Data>(path: string, options?: RequestOptions): Promise<Data>
  patch<Data>(path: string, options?: RequestOptions): Promise<Data>
  delete<Data>(path: string, options?: RequestOptions): Promise<Data>
}

/**
 * The ergonomic face of a pipeline: one method per HTTP verb, resolving with the response body.
 */
export function createHttp(transport: Transport): Http {
  async function request<Data>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<Data> {
    const response = await transport({ method, url: path, headers: {}, ...options })
    return response.body as Data
  }

  return {
    request,
    get: (path, options) => request('GET', path, options),
    post: (path, options) => request('POST', path, options),
    put: (path, options) => request('PUT', path, options),
    patch: (path, options) => request('PATCH', path, options),
    delete: (path, options) => request('DELETE', path, options)
  }
}
