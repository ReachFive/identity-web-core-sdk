import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties, snakeCaseProperties } from '../utils/transformObjectProperties'
import isEmpty from 'lodash/isEmpty'

export type HttpConfig = {
  baseUrl: string
  language?: string
  acceptCookies?: boolean
}

export type RequestParams = {
  method?: 'GET' | 'POST' | 'DELETE'
  query?: QueryString
  body?: {}
  accessToken?: string
  withCookies?: boolean
}

export type GetRequestParams = Omit<RequestParams, 'body' | 'method'>
export type DeleteRequestParams = Omit<RequestParams, 'body' | 'method'>
export type PostRequestParams = Omit<RequestParams, 'method'>

export interface HttpClient {
  get<Data>(path: string, options: GetRequestParams): Promise<Data>
  post<Data>(path: string, options: PostRequestParams): Promise<Data>
  remove<Data>(path: string, options: DeleteRequestParams): Promise<Data>
  request<Data>(path: string, options: RequestParams): Promise<Data>
}

export function createHttpClient(config: HttpConfig): HttpClient {
  function get<Data>(path: string, params: GetRequestParams) {
    return request<Data>(path, { ...params, method: 'GET' })
  }

  function remove<Data>(path: string, params: DeleteRequestParams) {
    return request<Data>(path, { ...params, method: 'DELETE' })
  }

  function post<Data>(path: string, params: PostRequestParams) {
    return request<Data>(path, { ...params, method: 'POST' })
  }

  function request<Data>(path: string, params: RequestParams): Promise<Data> {
    const { method = 'GET', query = {}, body, accessToken = null, withCookies = false } = params

    const fullPath = query && !isEmpty(query) ? `${path}?${toQueryString(query)}` : path

    const url = fullPath.startsWith('http') ? fullPath : config.baseUrl + fullPath

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...(accessToken && { Authorization: 'Bearer ' + accessToken }),
        ...(config.language && { 'Accept-Language': config.language }),
        ...(body && { 'Content-Type': 'application/json;charset=UTF-8' })
      },
      ...(withCookies && config.acceptCookies && { credentials: 'include' }),
      ...(body && { body: JSON.stringify(snakeCaseProperties(body)) })
    }

    return rawRequest(url, fetchOptions)
  }

  return { get, remove, post, request }
}

/**
 * Low level HTTP client
 */
export function rawRequest<Data>(url: string, fetchOptions?: RequestInit) {
  return fetch(url, fetchOptions).then(response => {
    if (response.status !== 204) {
      const dataP = (response.json().then(camelCaseProperties) as any) as Promise<Data>
      return response.ok ? dataP : dataP.then(data => Promise.reject(data))
    }
    return (undefined as any) as Data
  })
}
