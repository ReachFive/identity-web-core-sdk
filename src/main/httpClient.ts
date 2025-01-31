import { QueryString, toQueryString } from '../utils/queryString'
import { camelCaseProperties, snakeCaseProperties } from '../utils/transformObjectProperties'
import isEmpty from 'lodash/isEmpty'

export type HttpConfig = {
  baseUrl: string
  language?: string
  locale?: string
  acceptCookies?: boolean
}

export type RequestParams = {
  method?: 'GET' | 'POST' | 'DELETE'
  query?: QueryString
  body?: object
  accessToken?: string
  withCookies?: boolean
}

export type GetRequestParams = Omit<RequestParams, 'body' | 'method'>
export type DeleteRequestParams = Omit<RequestParams, 'method'>
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
        ...(config.locale && {'Custom-Locale': config.locale }),
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
export async function rawRequest<Data>(url: string, fetchOptions?: RequestInit): Promise<Data> {
  const response = await fetch(url, fetchOptions)
  if (response.status == 204) return undefined as Data
    
  const json = await response.json()
  const data = camelCaseProperties(json)

  return response.ok ? data as Data : Promise.reject(data)
}
