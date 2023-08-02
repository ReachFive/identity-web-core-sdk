import { Buffer } from 'buffer/'

import { encodeToBase64 } from '../utils/base64'
import { randomBase64String } from '../utils/random'
import {setWithExpiry} from "../utils/sessionStorage"

export type PkceParams = { codeChallenge: string; codeChallengeMethod: string }

export function computePkceParams(): Promise<PkceParams> {
  const codeVerifier = randomBase64String()
  setWithExpiry('verifier_key', codeVerifier, 1000)

  return computeCodeChallenge(codeVerifier).then(challenge => {
    return {
      codeChallenge: challenge,
      codeChallengeMethod: 'S256'
    }
  })
}

function computeCodeChallenge(verifier: string): Promise<string> {
  const binaryChallenge = Buffer.from(verifier, 'utf-8')
    return new Promise(resolve => {
    window.crypto.subtle.digest('SHA-256', binaryChallenge).then(hash => {
      return resolve(encodeToBase64(hash))
    })
  })
}
