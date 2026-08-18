import { base64url } from 'jose'

/**
 * 32 random bytes as a 43-character base64url string. Used for the Google One Tap nonce and for
 * generating unique iframe element ids — not for PKCE, which delegates to `oauth4webapi`.
 */
export function randomBase64String(): string {
  return base64url.encode(crypto.getRandomValues(new Uint8Array(32)))
}
