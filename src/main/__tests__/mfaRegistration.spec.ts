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

describe('startMfaEmailRegistration', () => {
  test('sends the redirect URL of the verification email', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'email_sent' }))

    await client.startMfaEmailRegistration({ accessToken, redirectUrl: 'https://example.com/verified' })

    expect(lastFetchCall().body).toEqual({ redirect_url: 'https://example.com/verified' })
  })

  // An absent `trust_device` means `false` to the API, which rejects `true` when trusted devices are not enabled.
  test('only sends trustDevice when it is true', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'email_sent' }))
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'email_sent' }))

    await client.startMfaEmailRegistration({ accessToken, trustDevice: false })
    expect(lastFetchCall().body).toEqual({})

    await client.startMfaEmailRegistration({ accessToken, trustDevice: true })
    expect(lastFetchCall().body).toEqual({ trust_device: true })
  })
})

describe('verifyMfaEmailRegistration', () => {
  test('only sends trustDevice when it is true', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await client.verifyMfaEmailRegistration({ accessToken, verificationCode: '1234' })

    expect(lastFetchCall().body).toEqual({ verification_code: '1234' })
  })

  test('resolves with the new credential', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(
      JSON.stringify({
        type: 'email',
        email: 'john@example.com',
        friendly_name: 'Email',
        created_at: '2026-09-30T00:00:00Z'
      })
    )

    await expect(client.verifyMfaEmailRegistration({ accessToken, verificationCode: '1234' })).resolves.toEqual({
      type: 'email',
      email: 'john@example.com',
      friendlyName: 'Email',
      createdAt: '2026-09-30T00:00:00Z'
    })
  })
})

test('verifyMfaPhoneNumberRegistration resolves with the new credential', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(
    JSON.stringify({
      type: 'sms',
      phone_number: '+33600000000',
      friendly_name: 'SMS',
      created_at: '2026-09-30T00:00:00Z'
    })
  )

  await expect(client.verifyMfaPhoneNumberRegistration({ accessToken, verificationCode: '1234' })).resolves.toEqual({
    type: 'sms',
    phoneNumber: '+33600000000',
    friendlyName: 'SMS',
    createdAt: '2026-09-30T00:00:00Z'
  })
})
