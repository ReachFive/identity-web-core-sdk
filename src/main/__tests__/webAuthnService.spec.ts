/**
 * Covers the WebAuthn serialisation boundary.
 *
 * The encodings here are not arbitrary: the CIAM backend serialises these fields with Java's
 * `Base64.getUrlEncoder` and reads them back with `Base64.getUrlDecoder`
 * (see `webauthn/api/ByteList.scala`). Concretely:
 *
 *   - challenge and user.id       base64url WITH padding    (`ByteList.formatter`)
 *   - credential descriptor ids   base64url WITHOUT padding (`withoutPadding = true`)
 *   - everything the SDK sends    must be base64url, because `getUrlDecoder` rejects `+` and `/`
 *
 * These tests pin that wire format, so a change of encoding library cannot quietly alter it.
 */
import {
  encodePublicKeyCredentialCreationOptions,
  encodePublicKeyCredentialRequestOptions,
  serializeAuthenticationPublicKeyCredential,
  serializeRegistrationPublicKeyCredential
} from '../webAuthnService'

/**
 * Six bytes whose *standard* base64 needs both `+` and `/`, so an alphabet mistake cannot slip past.
 * Six bytes also encode to exactly eight base64 characters, hence no padding in either form.
 */
const TRICKY_BYTES = new Uint8Array([0, 0, 0, 251, 255, 190])
const TRICKY_BASE64_STANDARD = 'AAAA+/++'
const TRICKY_BASE64URL = 'AAAA-_--'

/** Five bytes encode to seven base64 characters, so this pair exercises padding. */
const FIVE_BYTES = new Uint8Array([1, 2, 3, 4, 5])

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

    // Decoding tolerance is owned by `decodeBytes`, not inherited from whichever base64
    // implementation happens to be installed: jose 5 accepts the standard alphabet and jose 6 does
    // not. A failed passkey decode breaks registration and login outright, and nothing in this
    // repository can exercise that path, so the tolerance is pinned here.
    //
    // The first case of each pair is what the backend actually emits. The second is not, and is
    // covered so that tightening the decoder shows up as a test failure rather than a support ticket.
    test.each([
      ['base64url (what the backend emits)', TRICKY_BASE64URL, TRICKY_BYTES],
      ['standard base64', TRICKY_BASE64_STANDARD, TRICKY_BYTES],
      ['base64url with padding (what the backend emits)', 'AQIDBAU=', FIVE_BYTES],
      ['base64url without padding', 'AQIDBAU', FIVE_BYTES]
    ])('decodes %s', (_label, challenge, expected) => {
      const encoded = encodePublicKeyCredentialRequestOptions({ challenge, allowCredentials: [] } as never)

      expect(bytesOf(encoded.challenge)).toEqual(Array.from(expected))
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
