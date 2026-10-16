import type { Middleware } from '../transport'

export type LocaleOptions = {
  language?: string
  locale?: string
}

export function withLocaleHeaders({ language, locale }: LocaleOptions): Middleware {
  return (next) => (request) =>
    next({
      ...request,
      headers: {
        ...request.headers,
        ...(language && { 'Accept-Language': language }),
        ...(locale && { 'Custom-Locale': locale })
      }
    })
}
