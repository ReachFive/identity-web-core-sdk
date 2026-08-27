import { base64url } from 'jose'

export type PkceParams = { codeChallenge: string; codeChallengeMethod: string }

export type WithPkceParams<T> = T & Partial<PkceParams>

/**
 * Proof Key for Code Exchange, per RFC 7636.
 *
 * Generates a `code_verifier`, stashes it for the later token exchange, and returns the
 * `code_challenge` derived from it.
 */
export async function computePkceParams(): Promise<PkceParams> {
  const codeVerifier = generateCodeVerifier()

  localStorage.setItem('verifier_key', codeVerifier)

  return {
    codeChallenge: await calculateCodeChallenge(codeVerifier),
    codeChallengeMethod: 'S256'
  }
}

/** RFC 7636 §4.1: 32 random bytes, base64url-encoded, giving a 43-character verifier. */
function generateCodeVerifier(): string {
  return base64url.encode(crypto.getRandomValues(new Uint8Array(32)))
}

/** RFC 7636 §4.2, S256 transformation: BASE64URL(SHA256(ASCII(code_verifier))). */
async function calculateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  return base64url.encode(new Uint8Array(digest))
}
