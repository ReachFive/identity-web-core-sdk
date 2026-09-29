import { base64url } from 'jose'

import { parseJwtTokenPayload } from '../jwt'

function unsignedIdToken(claims: object) {
  const encode = (part: object) => base64url.encode(JSON.stringify(part))
  return `${encode({ alg: 'none' })}.${encode(claims)}.`
}

// The id token carries `custom_fields`, keyed by account-defined paths.
test('keeps custom field claims exactly as issued, and camel-cases the rest', () => {
  const payload = parseJwtTokenPayload(
    unsignedIdToken({ given_name: 'John', email_verified: true, custom_fields: { my_obj: { some_key: 1 } } })
  )

  expect(payload).toEqual({ givenName: 'John', emailVerified: true, customFields: { my_obj: { some_key: 1 } } })
})
