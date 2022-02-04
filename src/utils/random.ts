import { encodeToBase64 } from './base64'

function randomBase64String(): string {
  const randomValues = window.crypto.getRandomValues(new Uint8Array(32))
  return encodeToBase64(randomValues)
}

export { randomBase64String }
