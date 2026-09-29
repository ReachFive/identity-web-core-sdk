import type { ResponseType } from './authOptions'

type ResponseMode = 'web_message'
type Display = 'page' | 'popup' | 'touch' | 'wap'

/**
 * This type represents the parameters that are actually sent to the HTTP API
 */
export type AuthParameters = {
  responseType: ResponseType
  responseMode?: ResponseMode
  scope: string
  display?: Display
  redirectUri?: string
  /** One or several `Prompt` values, space-separated. */
  prompt?: string
  origin?: string
  state?: string
  nonce?: string
  providerScope?: string
  idTokenHint?: string
  loginHint?: string
  accessToken?: string
  persistent?: boolean
  maxAge?: number
  uiLocales?: string
  acrValues?: string
}
