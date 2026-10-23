/**
 * @jest-environment node
 */
import { camelCaseKey, snakeCaseKey } from '../transformObjectProperties'

// Response keys are camel-cased on the way in, and a camel-cased object handed back to the API (a profile,
// for instance) is snake-cased on the way out. A key that does not survive that round trip reaches the
// server under the wrong name.
//
// The API's keys are snake-cased field names, with digits never separated from the letters before them
// (`r5_request_token`). So every key is made of lowercase segments joined by single underscores. What is tested here is that grammar, not a list of keys:
// a list would drift from the API, a rule does not.

// Every segment shape the round trip supports: letters, optionally followed by digits.
const segments = ['a', 'id', 'url', 'json', 'authn', 'r5', 'v2', 'utf8', 'id2']

// The API reads a run of capitals as one word (`photoURL` → `photo_url`), so it never emits two one-letter
// segments in a row after the first one: `id_a_b` would have to come from `idAB`, which becomes `id_ab`.
// Those keys are left out of the grammar.
const outOfGrammar = /_[a-z]_[a-z](?=_|$)/

function keysOf(length: number): string[] {
  if (length === 1) return segments
  return keysOf(length - 1)
    .flatMap((prefix) => segments.map((segment) => `${prefix}_${segment}`))
    .filter((key) => !outOfGrammar.test(key))
}

describe('wire key round trip', () => {
  test.each([1, 2, 3])('holds for every key of %i segment(s)', (length) => {
    const broken = keysOf(length).filter((key) => snakeCaseKey(camelCaseKey(key)) !== key)

    expect(broken).toEqual([])
  })

  test('reads a run of capitals as one word, as the API does', () => {
    expect(snakeCaseKey('clientDataJSON')).toBe('client_data_json')
    expect(snakeCaseKey('photoURL')).toBe('photo_url')
  })

  test.each(['error_user_msg', 'r5_request_token', 'client_data_json', 'web_authn', 'profile_url'])(
    'holds for a real key such as %s',
    (key) => {
      expect(snakeCaseKey(camelCaseKey(key))).toBe(key)
    }
  )

  // The `password_policy` of `/identity/v1/config` is sent with camelCase keys.
  test.each(['minLength', 'allowUpdateWithAccessTokenOnly'])(
    'leaves a key already in camelCase, such as %s, as is',
    (key) => {
      expect(camelCaseKey(key)).toBe(key)
    }
  )

  // Outside that grammar the heuristic is lossy. Keys like these are data, not schema — which is why
  // `dynamicKeys` protects the objects holding them — or come from formats the SDK does not read (`x5c` is
  // a JWKS field).
  test.each([
    ['a custom provider key with a digit segment', 'x_2'],
    ['a custom provider key with a double underscore', 'a__b'],
    ['a client id', 'kqIJEa7Bx9Zt2LmQpR4s'],
    ['a digit followed by letters in one segment', 'x5c'],
    ['two one-letter segments in a row', 'id_a_b']
  ])('does not hold for %s (%s)', (_, key) => {
    expect(snakeCaseKey(camelCaseKey(key))).not.toBe(key)
  })
})
