import { Buffer } from 'buffer/'

import { encodeToBase64 } from '../utils/base64'

export type PkceParams = { codeChallenge: string; codeChallengeMethod: string }

export function computePkceParams(): Promise<PkceParams> {
  const verifier = generateCodeVerifier()
  sessionStorage.setItem('verifier_key', verifier)
  return computeCodeChallenge(verifier).then(challenge => {
    return {
      codeChallenge: challenge,
      codeChallengeMethod: 'S256'
    }
  })
}

function generateCodeVerifier(): string {
  return encodeToBase64(window.crypto.getRandomValues(new Uint8Array(32)))
}

function computeCodeChallenge(verifier: string): Promise<string> {
  const binaryChallenge = Buffer.from(verifier, 'utf-8')
  return new Promise(resolve => {
    window.crypto.subtle.digest('SHA-256', binaryChallenge).then(hash => {
      return resolve(encodeToBase64(hash))
    })
  })
}
