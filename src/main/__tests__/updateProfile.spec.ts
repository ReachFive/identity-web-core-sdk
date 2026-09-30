import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, lastFetchCall, mockWindowCrypto } from './helpers/testHelpers'

const accessToken = 'W8ub2c0Lm1lIiwic3ViIjoiQVdYMmdFeWswOTB'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

describe('updateProfile', () => {
  test("sends an address's default flag under the name the API reads, `default`", async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.updateProfile({ accessToken, data: { addresses: [{ streetAddress: '1 rue X', isDefault: true }] } })

    expect(lastFetchCall().body.addresses).toEqual([{ street_address: '1 rue X', default: true }])
  })

  test('accepts the default flag as `default` too', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.updateProfile({ accessToken, data: { addresses: [{ streetAddress: '1 rue X', default: true }] } })

    expect(lastFetchCall().body.addresses).toEqual([{ street_address: '1 rue X', default: true }])
  })
})

describe('updateEmail', () => {
  test('sends the captcha provider along with its token', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.updateEmail({
      accessToken,
      email: 'new@example.com',
      captchaToken: 't',
      captchaProvider: 'captchafox'
    })

    expect(lastFetchCall().body).toEqual({
      email: 'new@example.com',
      captcha_token: 't',
      captcha_provider: 'captchafox'
    })
  })

  test('resolves with the updated profile', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ id: 'AVPw', email: 'new@example.com' }))

    await expect(client.updateEmail({ accessToken, email: 'new@example.com' })).resolves.toEqual({
      id: 'AVPw',
      email: 'new@example.com'
    })
  })
})

test('updatePhoneNumber resolves with the updated profile', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ id: 'AVPw', phone_number: '+33600000000' }))

  await expect(client.updatePhoneNumber({ accessToken, phoneNumber: '+33600000000' })).resolves.toEqual({
    id: 'AVPw',
    phoneNumber: '+33600000000'
  })
})

describe('updatePassword', () => {
  test('does not send userId, which the API does not read', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce('', { status: 204 })

    await client.updatePassword({ accessToken, password: 'new', oldPassword: 'old', userId: 'u' })

    expect(lastFetchCall().body).toEqual({ client_id: expect.any(String), password: 'new', old_password: 'old' })
  })
})
