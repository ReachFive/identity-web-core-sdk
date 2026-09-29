import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

// Requests the SDK used to get wrong: values the API ignores, SDK-only options leaking onto the wire, and
// values sent under a name the API does not read.

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

describe('access token and provider scope', () => {
  test('are sent on a social login, where the API links the provider to the signed-in user', async () => {
    const { client } = createDefaultTestClient()

    await client.loginWithSocialProvider('facebook', { accessToken, providerScope: 'user_birthday' })

    const url = new URL((window.location.assign as jest.Mock).mock.calls[0][0])
    expect(url.searchParams.get('access_token')).toBe(accessToken)
    expect(url.searchParams.get('provider_scope')).toBe('user_birthday')
  })

  test('are not sent anywhere else, where the API ignores them', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.startPasswordless(
      { authType: 'magic_link', email: 'john@example.com' },
      { accessToken, providerScope: 'x' }
    )

    expect(lastCall().body).not.toHaveProperty('access_token')
    expect(lastCall().body).not.toHaveProperty('provider_scope')
  })
})

describe('the default address flag', () => {
  test('is sent under the name the API reads, `default`', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.updateProfile({ accessToken, data: { addresses: [{ streetAddress: '1 rue X', isDefault: true }] } })

    expect(lastCall().body.addresses).toEqual([{ street_address: '1 rue X', default: true }])
  })

  test('can also be given as `default`, the name the API returns it under', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.updateProfile({ accessToken, data: { addresses: [{ streetAddress: '1 rue X', default: true }] } })

    expect(lastCall().body.addresses).toEqual([{ street_address: '1 rue X', default: true }])
  })
})

test('verifyMfaPasswordless decodes the id token, like every other login method', async () => {
  const { client } = createDefaultTestClient()
  const payload = Buffer.from(JSON.stringify({ sub: 'AVPw', given_name: 'John' })).toString('base64url')
  const idToken = `eyJhbGciOiJub25lIn0.${payload}.`
  fetchMock.mockResponseOnce(
    JSON.stringify({ id_token: idToken, access_token: 'a', expires_in: 1, token_type: 'Bearer' })
  )

  const result = await client.verifyMfaPasswordless({ challengeId: 'c', verificationCode: '1234' })

  expect(result.idTokenPayload).toMatchObject({ sub: 'AVPw', givenName: 'John' })
})

describe('trustDevice', () => {
  // The API rejects any `trust_device` when trusted devices are not enabled on the account, even `false`,
  // and treats an absent value as `false`. So only `true` is ever worth sending.
  test('is left out of an MFA passwordless verification unless it is true', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.verifyMfaPasswordless({ challengeId: 'c', verificationCode: '1234', trustDevice: false })

    expect(lastCall().body).toEqual({ challenge_id: 'c', verification_code: '1234' })
  })

  test('is sent when true', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.verifyMfaPasswordless({ challengeId: 'c', verificationCode: '1234', trustDevice: true })

    expect(lastCall().body).toEqual({ challenge_id: 'c', verification_code: '1234', trust_device: true })
  })

  test('is left out of an MFA email registration unless it is true', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.verifyMfaEmailRegistration({ accessToken, verificationCode: '1234' })

    expect(lastCall().body).toEqual({ verification_code: '1234' })
  })
})

test('updateEmail sends the captcha provider along with its token', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({}))

  await client.updateEmail({ accessToken, email: 'new@example.com', captchaToken: 't', captchaProvider: 'captchafox' })

  expect(lastCall().body).toEqual({ email: 'new@example.com', captcha_token: 't', captcha_provider: 'captchafox' })
})

test('refreshTokens sends a scope given as an array as the space-separated string the API reads', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'a', expires_in: 1, token_type: 'Bearer' }))

  await client.refreshTokens({ refreshToken: 'r', scope: ['openid', 'email'] })

  expect(lastCall().body.scope).toBe('openid email')
})

describe('options that only mean something to the SDK', () => {
  test('are not sent with a password login', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ tkn: 'x' }))

    await client.loginWithPassword({ email: 'john@example.com', password: 'p', saveCredentials: false, action: 'x' })

    const { body } = fetchMock.mock.calls[1][1] as { body: string }
    expect(JSON.parse(body)).not.toHaveProperty('save_credentials')
    expect(JSON.parse(body)).not.toHaveProperty('action')
  })

  test('are not sent with a logout', async () => {
    const { client } = createDefaultTestClient()

    await client.logout({ redirectTo: 'https://example.com', removeCredentials: true })

    const url = new URL((window.location.assign as jest.Mock).mock.calls[0][0])
    expect(url.searchParams.has('remove_credentials')).toBe(false)
    expect(url.searchParams.get('redirect_to')).toBe('https://example.com')
  })
})

describe('values the API ignores', () => {
  test('loginLink is not sent with a password reset request', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.requestPasswordReset({ email: 'john@example.com', loginLink: 'https://example.com' })

    expect(lastCall().body).not.toHaveProperty('login_link')
  })

  test('userId is not sent with a password update', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.updatePassword({ accessToken, password: 'new', oldPassword: 'old', userId: 'u' })

    expect(lastCall().body).not.toHaveProperty('user_id')
  })

  test('persistent is not sent with an authorization code exchange', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'a', expires_in: 1, token_type: 'Bearer' }))

    await client.exchangeAuthorizationCodeWithPkce({ code: 'c', redirectUri: 'https://example.com', persistent: true })

    expect(lastCall().body).not.toHaveProperty('persistent')
  })
})
