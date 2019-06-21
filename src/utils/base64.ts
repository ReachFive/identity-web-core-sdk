/**
 * return an UTF-8 encoded string as URL Safe Base64
 *
 * Note: This function encodes to the RFC 4648 Spec where '+' is encoded
 *       as '-' and '/' is encoded as '_'. The padding character '=' is
 *       removed.
 */
export function encodeBase64UrlSafe(str: string) {
  return encodeBase64(str)
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, '') // Remove ending '='
}

/**
 * encode an UTF-8 encoded string as Base64
 */
export function encodeBase64(str: string) {
  // Cf: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode(parseInt(p1, 16))
    })
  )
}

/**
 * return an decoded URL Safe Base64 as UTF-8 encoded string
 */
export function decodeBase64UrlSafe(base64: string) {
  // Add removed at end '='
  // base64 += Array(5 - base64.length % 4).join('=');

  // tslint:disable-next-line: no-parameter-reassignment
  base64 = base64
    .replace(/\-/g, '+') // Convert '-' to '+'
    .replace(/\_/g, '/') // Convert '_' to '/'
  return decodeBase64(base64) // Cf: https://developer.mozilla.org/fr/docs/D%C3%A9coder_encoder_en_base64
}

/**
 * Encode an array into Base64 url safe - Used for PKCE random/hash functions.
 */
export function encodeToBase64(array: ArrayBuffer | Uint8Array): string {
    return Buffer.from(array)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

/**
 * decode Base64 as UTF-8 encoded string
 */
export function decodeBase64(str: string) {
  // Cf: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )
}
