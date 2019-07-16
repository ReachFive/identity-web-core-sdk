import * as v from 'validation.ts'
import uniq from 'lodash-es/uniq'
import pick from 'lodash-es/pick'
import isString from 'lodash-es/isString'
import isArray from 'lodash-es/isArray'
import isUndefined from 'lodash-es/isUndefined'

export const authOptions = v.object({
  responseType: v.optional(v.union('code', 'token')),
  redirectUri: v.optional(v.string),
  scope: v.optional(v.union(v.string, v.array(v.string))),
  fetchBasicProfile: v.optional(v.boolean),
  popupMode: v.optional(v.boolean),
  prompt: v.optional(v.string),
  nonce: v.optional(v.string),
  origin: v.optional(v.string),
  state: v.optional(v.string),
  providerScope: v.optional(v.string),
  idTokenHint: v.optional(v.string),
  loginHint: v.optional(v.string),
  accessToken: v.optional(v.string),
  requireRefreshToken: v.optional(v.boolean),
  acceptTos: v.optional(v.boolean)
})

export type AuthOptions = typeof authOptions.T

type AuthParameters = {
  responseType: 'code' | 'token'
  scope: string
  display: string
  redirectUri?: string
  prompt?: string
  nonce?: string
  origin?: string
  state?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  accessToken?: string
  acceptTos?: boolean
}

export function resolveScope(opts: AuthOptions = {}, defaultScopes: string | undefined): string {
  const fetchBasicProfile = isUndefined(opts.fetchBasicProfile) || opts.fetchBasicProfile
  const scopes = isUndefined(opts.scope) ? defaultScopes : opts.scope
  return uniq([
    ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
    ...(opts.requireRefreshToken ? ['offline_access'] : []),
    ...parseScope(scopes),
  ]).join(' ')
}

export function prepareAuthOptions(opts: AuthOptions = {}, { acceptPopupMode = false } = {}, defaultScopes: string | undefined): AuthParameters {
  return {
    responseType: opts.redirectUri ? 'code' : 'token',
    scope: resolveScope(opts, defaultScopes),
    display: opts.popupMode && acceptPopupMode ? 'popup' : 'page',
    ...pick(opts, [
      'responseType',
      'redirectUri',
      'prompt',
      'nonce',
      'origin',
      'state',
      'providerScope',
      'idTokenHint',
      'loginHint',
      'accessToken',
      'acceptTos',
    ]),
  }
}

function parseScope(scope: string[] | string | undefined): string[] {
  if (isUndefined(scope)) return []
  if (isArray(scope)) return scope
  if (isString(scope)) return scope.split(' ')
  throw new Error('Invalid scope format: string or array expected.')
}
