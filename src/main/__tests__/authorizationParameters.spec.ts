import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, lastAssignedUrl, lastFetchCall, mockWindowCrypto } from './helpers/testHelpers'

const accessToken = 'W8ub2c0Lm1lIiwic3ViIjoiQVdYMmdFeWswOTB'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
  defineWindowProperty('location')
})

describe('accessToken and providerScope', () => {
  test('are sent on a social login, where the API links the provider to the signed-in user', async () => {
    const { client } = createDefaultTestClient()

    await client.loginWithSocialProvider('facebook', { accessToken, providerScope: 'user_birthday' })

    expect(lastAssignedUrl().searchParams.get('access_token')).toBe(accessToken)
    expect(lastAssignedUrl().searchParams.get('provider_scope')).toBe('user_birthday')
  })

  test('are not sent with other flows, which do not read them', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.startPasswordless(
      { authType: 'magic_link', email: 'john@example.com' },
      { accessToken, providerScope: 'x' }
    )

    expect(lastFetchCall().body).not.toHaveProperty('access_token')
    expect(lastFetchCall().body).not.toHaveProperty('provider_scope')
  })

  test('are left out without dropping any other parameter', async () => {
    const { client } = createDefaultTestClient({ sso: true })

    await client.loginFromSession({
      redirectUri: 'https://example.com/callback',
      state: 's',
      nonce: 'n',
      loginHint: 'john@example.com',
      accessToken,
      providerScope: 'x'
    })

    const url = lastAssignedUrl()
    expect(url.searchParams.has('access_token')).toBe(false)
    expect(url.searchParams.has('provider_scope')).toBe(false)
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      redirect_uri: 'https://example.com/callback',
      state: 's',
      nonce: 'n',
      login_hint: 'john@example.com',
      scope: 'openid profile email phone'
    })
  })
})

test('maxAge, uiLocales and acrValues are sent', async () => {
  const { client } = createDefaultTestClient()

  await client.loginWithSocialProvider('facebook', { maxAge: 3600, uiLocales: 'fr-FR en', acrValues: 'mfa' })

  expect(lastAssignedUrl().searchParams.get('max_age')).toBe('3600')
  expect(lastAssignedUrl().searchParams.get('ui_locales')).toBe('fr-FR en')
  expect(lastAssignedUrl().searchParams.get('acr_values')).toBe('mfa')
})

test('prompt can be a list, sent space-separated', async () => {
  const { client } = createDefaultTestClient()

  await client.loginWithSocialProvider('facebook', { prompt: ['login', 'consent'] })

  expect(lastAssignedUrl().searchParams.get('prompt')).toBe('login consent')
})
