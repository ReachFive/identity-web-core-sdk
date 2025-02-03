import { camelCaseProperties, snakeCaseProperties } from './transformObjectProperties'

export type QueryString = Record<string, string | string[] | number | boolean | undefined>

/**
 * Basic query string parser.
 * !! Does not support multi valued parameters
 */
export function parseQueryString(queryString: string): Record<string, string | undefined> {
  const qs = queryString.split('&').reduce((acc, param) => {
    const [key, value = ''] = param.split('=')
    if (key && key.length) {
      return {
        ...acc,
        [key]: decodeURIComponent(value.replace(/\+/g, ' '))
      }
    } else {
      return acc
    }
  }, {})
  return camelCaseProperties(qs) as Record<string, string | undefined>
}

export function toQueryString(obj: QueryString, snakeCase = true): string {
  const params = snakeCase ? snakeCaseProperties(obj) : obj
  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => (
      value !== '' ? `${key}=${encodeURIComponent(value)}` : key
    ))
    .join('&')
}
