import { base64url } from 'jose'

/**
 * 32 cryptographically random bytes as a 43-character base64url string.
 *
 * Used for the Google One Tap nonce and for generating unique iframe element ids. PKCE has its own
 * generator in `main/pkceService.ts`, kept separate because its length is fixed by RFC 7636 and must
 * not follow a change made here for one of the callers above.
 */
export function randomBase64String(): string {
  return base64url.encode(crypto.getRandomValues(new Uint8Array(32)))
}
