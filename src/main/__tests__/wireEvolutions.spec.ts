import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

// Parameters the API accepts that the SDK had no way to send.

const accessToken = 'W8ub2c0Lm1lIiwic3ViIjoiQVdYMmdFeWswOTB'

function lastCall() {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]
  return { url: String(url), body: init?.body ? JSON.parse(init.body as string) : undefined }
}

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
  defineWindowProperty('location')
})

describe('authorization options', () => {
  test('maxAge, uiLocales and acrValues are sent', async () => {
    const { client } = createDefaultTestClient()

    await client.loginWithSocialProvider('facebook', { maxAge: 3600, uiLocales: 'fr-FR en', acrValues: 'mfa' })

    const url = new URL((window.location.assign as jest.Mock).mock.calls[0][0])
    expect(url.searchParams.get('max_age')).toBe('3600')
    expect(url.searchParams.get('ui_locales')).toBe('fr-FR en')
    expect(url.searchParams.get('acr_values')).toBe('mfa')
  })

  test('prompt can be a list, sent space-separated', async () => {
    const { client } = createDefaultTestClient()

    await client.loginWithSocialProvider('facebook', { prompt: ['login', 'consent'] })

    const url = new URL((window.location.assign as jest.Mock).mock.calls[0][0])
    expect(url.searchParams.get('prompt')).toBe('login consent')
  })
})

test('startPasswordless can send the profile data used to sign up a new user', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.startPasswordless({
    authType: 'magic_link',
    email: 'john@example.com',
    data: {
      givenName: 'John',
      customFields: { my_obj: { someKey: 1 } },
      addresses: [{ streetAddress: '1 rue X', isDefault: true }]
    }
  })

  expect(lastCall().body.data).toEqual({
    given_name: 'John',
    custom_fields: { my_obj: { someKey: 1 } },
    addresses: [{ street_address: '1 rue X', default: true }]
  })
})

describe('requestPasswordReset', () => {
  test('accepts a custom identifier', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.requestPasswordReset({ customIdentifier: 'member-42' })

    expect(lastCall().body).toMatchObject({ custom_identifier: 'member-42' })
  })

  test('accepts a state', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.requestPasswordReset({ email: 'john@example.com', state: 'xyz' })

    expect(lastCall().body).toMatchObject({ state: 'xyz' })
  })
})

test('startMfaEmailRegistration accepts the redirect URL of the verification email', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ status: 'email_sent' }))

  await client.startMfaEmailRegistration({ accessToken, redirectUrl: 'https://example.com/verified' })

  expect(lastCall().body).toMatchObject({ redirect_url: 'https://example.com/verified' })
})

test('unlink can keep the identity in a lite profile', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.unlink({ accessToken, identityId: 'facebook:1', keepInLiteProfile: true })

  // The API reads this one from the query string, in camelCase.
  expect(new URL(lastCall().url).searchParams.get('keepInLiteProfile')).toBe('true')
  expect(lastCall().body).toEqual({ identity_id: 'facebook:1' })
})

test('a password grant login sends the nonce of the auth options', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'a', expires_in: 1, token_type: 'Bearer' }))
  defineWindowProperty('cordova', {})
  try {
    await client.loginWithPassword({ email: 'john@example.com', password: 'p', auth: { nonce: 'n-0S6_WzA2Mj' } })
  } finally {
    delete (window as { cordova?: unknown }).cordova
  }

  expect(lastCall().body).toMatchObject({ grant_type: 'password', nonce: 'n-0S6_WzA2Mj' })
})
