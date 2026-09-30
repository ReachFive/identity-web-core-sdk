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
