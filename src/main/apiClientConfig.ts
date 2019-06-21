import * as v from 'validation.ts'


export const apiClientConfig = v.object({
  clientId: v.string,
  domain: v.string,
  sso: v.optional(v.boolean),
  language: v.optional(v.string),
  pkce: v.optional(v.boolean)
})

export type ApiClientConfig = typeof apiClientConfig.T