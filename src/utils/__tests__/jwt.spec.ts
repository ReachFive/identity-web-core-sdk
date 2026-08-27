import { base64url } from 'jose'

import { parseJwtTokenPayload } from '../jwt'

const idToken = (claims: Record<string, unknown>) =>
  [
    base64url.encode(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))),
    base64url.encode(new TextEncoder().encode(JSON.stringify(claims))),
    'signature-is-not-verified'
  ].join('.')

describe('parseJwtTokenPayload', () => {
  test('camelCases the OIDC claim names the wire uses', () => {
    const payload = parseJwtTokenPayload(
      idToken({
        given_name: 'Ada',
        family_name: 'Lovelace',
        email_verified: true,
        phone_number: '+33600000000',
        preferred_username: 'ada',
        at_hash: 'hash',
        auth_time: 1700000000,
        updated_at: '2026-01-01'
      })
    )

    expect(payload.givenName).toBe('Ada')
    expect(payload.familyName).toBe('Lovelace')
    expect(payload.emailVerified).toBe(true)
    expect(payload.phoneNumber).toBe('+33600000000')
    expect(payload.preferredUsername).toBe('ada')
    expect(payload.atHash).toBe('hash')
    expect(payload.authTime).toBe(1700000000)
    expect(payload.updatedAt).toBe('2026-01-01')
  })

  test('passes the registered JWT claims through untouched', () => {
    // These are single words, which is precisely why `IdTokenPayload` can inherit them from jose
    // even though every response goes through snake_case-to-camelCase conversion.
    const claims = { iss: 'https://example.reach5.net', sub: 'user-1', jti: 'token-1', nbf: 1, exp: 2, iat: 3 }
    const payload = parseJwtTokenPayload(idToken({ ...claims, aud: ['client-1'] }))

    expect(payload).toMatchObject(claims)
    expect(payload.aud).toEqual(['client-1'])
  })

  test('camelCases the nested address claim', () => {
    const payload = parseJwtTokenPayload(
      idToken({ address: { street_address: '1 rue de la Paix', postal_code: '75002', country: 'FR' } })
    )

    expect(payload.address).toEqual({ streetAddress: '1 rue de la Paix', postalCode: '75002', country: 'FR' })
  })

  test('leaves custom field keys alone, since they are chosen by the account', () => {
    const payload = parseJwtTokenPayload(idToken({ custom_fields: { my_field: 'kept', another_One: 'kept too' } }))

    expect(payload.customFields).toEqual({ my_field: 'kept', another_One: 'kept too' })
  })

  test('decodes non-ASCII claim values', () => {
    expect(parseJwtTokenPayload(idToken({ given_name: 'Amélie 日本 🔐' })).givenName).toBe('Amélie 日本 🔐')
  })

  test('throws on a malformed token, which enrichAuthResult catches and logs', () => {
    expect(() => parseJwtTokenPayload('not-a-jwt')).toThrow()
  })
})
