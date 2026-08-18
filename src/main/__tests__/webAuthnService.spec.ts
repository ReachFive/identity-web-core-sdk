/**
 * Covers the WebAuthn serialisation boundary, which had no tests at all.
 *
 * The encodings here are not arbitrary: the CIAM backend serialises these fields with Java's
 * `Base64.getUrlEncoder` and reads them back with `Base64.getUrlDecoder`
 * (see `webauthn/api/ByteList.scala`). Concretely:
 *
 *   - challenge and user.id       base64url WITH padding    (`ByteList.formatter`)
 *   - credential descriptor ids   base64url WITHOUT padding (`withoutPadding = true`)
 *   - everything the SDK sends    must be base64url, because `getUrlDecoder` rejects `+` and `/`
 *
 * The expected values below were produced by the previous `buffer`-based implementation, so these
 * tests pin the wire format across that swap.
 */
import {
  encodePublicKeyCredentialCreationOptions,
  encodePublicKeyCredentialRequestOptions,
  serializeAuthenticationPublicKeyCredential,
  serializeRegistrationPublicKeyCredential
} from '../webAuthnService'

/**
 * Bytes whose *standard* base64 needs both `+` and `/`, so an alphabet mistake cannot slip past.
 * The encodings below come from the previous `buffer`-based implementation.
 */
const TRICKY_BYTES = new Uint8Array([0, 0, 0, 251, 255, 190])
const TRICKY_BASE64_STANDARD = 'AAAA+/++'
const TRICKY_BASE64URL = 'AAAA-_--'

const bytesOf = (value: BufferSource) =>
  Array.from(
    ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value)
  )

describe('webAuthnService encoding invariants', () => {
  test('the fixture really does exercise the +/- alphabet difference', () => {
    expect(TRICKY_BASE64_STANDARD).toContain('+')
    expect(TRICKY_BASE64_STANDARD).toContain('/')
    expect(TRICKY_BASE64_STANDARD.replace(/\+/g, '-').replace(/\//g, '_')).toBe(TRICKY_BASE64URL)
  })

  describe('decoding what the backend sends', () => {
    test('accepts a padded base64url challenge and user id, as ByteList.formatter emits', () => {
      const encoded = encodePublicKeyCredentialCreationOptions({
        rp: { name: 'ReachFive' },
        user: { id: 'AQIDBAU=', displayName: 'Ada', name: 'ada@example.com' },
        challenge: TRICKY_BASE64URL,
        pubKeyCredParams: []
      } as never)

      expect(bytesOf(encoded.challenge)).toEqual(Array.from(TRICKY_BYTES))
      expect(bytesOf(encoded.user.id)).toEqual([1, 2, 3, 4, 5])
    })

    test('accepts unpadded base64url credential descriptor ids, as withoutPadding emits', () => {
      const encoded = encodePublicKeyCredentialCreationOptions({
        rp: { name: 'ReachFive' },
        user: { id: 'AQIDBAU', displayName: 'Ada', name: 'ada@example.com' },
        challenge: 'AQIDBAU',
        pubKeyCredParams: [],
        excludeCredentials: [{ type: 'public-key', id: 'AQIDBAU' }]
      } as never)

      expect(bytesOf(encoded.challenge)).toEqual([1, 2, 3, 4, 5])
      expect(bytesOf(encoded.excludeCredentials![0].id)).toEqual([1, 2, 3, 4, 5])
    })

    test('decodes authentication options the same way', () => {
      const encoded = encodePublicKeyCredentialRequestOptions({
        challenge: TRICKY_BASE64URL,
        allowCredentials: [{ type: 'public-key', id: 'AQIDBAU' }]
      } as never)

      expect(bytesOf(encoded.challenge)).toEqual(Array.from(TRICKY_BYTES))
      expect(bytesOf(encoded.allowCredentials![0].id)).toEqual([1, 2, 3, 4, 5])
    })

    test('is alphabet-agnostic on the way in, matching the previous buffer-based behaviour', () => {
      // jose 5's decoder is lenient: it accepts the standard alphabet too, exactly as
      // `Buffer.from(x, 'base64')` did. The backend only ever emits base64url
      // (`Base64.getUrlEncoder`), so this is about not regressing, not about relying on it.
      // Note jose 6 tightened this and rejects `+` and `/`.
      const fromUrlSafe = encodePublicKeyCredentialRequestOptions({
        challenge: TRICKY_BASE64URL,
        allowCredentials: []
      } as never)
      const fromStandard = encodePublicKeyCredentialRequestOptions({
        challenge: TRICKY_BASE64_STANDARD,
        allowCredentials: []
      } as never)

      expect(bytesOf(fromStandard.challenge)).toEqual(bytesOf(fromUrlSafe.challenge))
      expect(bytesOf(fromUrlSafe.challenge)).toEqual(Array.from(TRICKY_BYTES))
    })
  })

  describe('encoding what the backend reads back', () => {
    const asArrayBuffer = (bytes: Uint8Array) => bytes.buffer.slice(0) as ArrayBuffer

    test('a registration credential is serialised as unpadded base64url', () => {
      const serialised = serializeRegistrationPublicKeyCredential({
        id: 'credential-id',
        type: 'public-key',
        rawId: asArrayBuffer(TRICKY_BYTES),
        response: {
          clientDataJSON: asArrayBuffer(new Uint8Array([1, 2, 3, 4, 5])),
          attestationObject: asArrayBuffer(TRICKY_BYTES),
          getTransports: () => ['internal']
        }
      } as never)

      expect(serialised.rawId).toBe(TRICKY_BASE64URL)
      expect(serialised.response.attestationObject).toBe(TRICKY_BASE64URL)
      expect(serialised.response.clientDataJSON).toBe('AQIDBAU')
      expect(serialised.response.transports).toEqual(['internal'])
      expect(serialised.rawId).not.toContain('+')
      expect(serialised.rawId).not.toContain('/')
      expect(serialised.rawId).not.toContain('=')
    })

    test('an authentication credential is serialised as unpadded base64url', () => {
      const serialised = serializeAuthenticationPublicKeyCredential({
        id: 'credential-id',
        type: 'public-key',
        rawId: asArrayBuffer(TRICKY_BYTES),
        response: {
          authenticatorData: asArrayBuffer(TRICKY_BYTES),
          clientDataJSON: asArrayBuffer(new Uint8Array([1, 2, 3, 4, 5])),
          signature: asArrayBuffer(TRICKY_BYTES),
          userHandle: asArrayBuffer(new Uint8Array([9]))
        }
      } as never)

      expect(serialised.rawId).toBe(TRICKY_BASE64URL)
      expect(serialised.response.signature).toBe(TRICKY_BASE64URL)
      expect(serialised.response.clientDataJSON).toBe('AQIDBAU')
      expect(serialised.response.userHandle).toBe('CQ')
    })

    test('a null userHandle stays absent rather than becoming a string', () => {
      const serialised = serializeAuthenticationPublicKeyCredential({
        id: 'credential-id',
        type: 'public-key',
        rawId: asArrayBuffer(new Uint8Array([1])),
        response: {
          authenticatorData: asArrayBuffer(new Uint8Array([1])),
          clientDataJSON: asArrayBuffer(new Uint8Array([1])),
          signature: asArrayBuffer(new Uint8Array([1])),
          userHandle: null
        }
      } as never)

      expect(serialised.response.userHandle).toBeNull()
    })
  })
})
