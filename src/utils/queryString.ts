import { snakeCaseProperties } from './transformObjectProperties'

export type QueryString = Record<string, string | string[] | number | boolean | undefined>

export function toQueryString(obj: QueryString, snakeCase = true): string {
  const params = snakeCase ? snakeCaseProperties(obj) : obj
  return Object.entries(params)
    .filter((entry): entry is [string, string | number | boolean] => {
      const [_, value] = entry
      return !Array.isArray(value) && value !== null && value !== undefined
    })
    .map(([key, value]) => (value !== '' ? `${key}=${encodeURIComponent(value)}` : key))
    .join('&')
}
