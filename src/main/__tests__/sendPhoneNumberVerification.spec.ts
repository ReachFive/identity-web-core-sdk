import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('send verification for phone number', async () => {
  const { client, domain } = createDefaultTestClient()

  const apiCall = fetchMock.mockResponseOnce(JSON.stringify(''))
  const accessToken = '123'

  client.sendPhoneNumberVerification({ accessToken }).then(() => {
    expect(apiCall).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/send-phone-number-verification`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          ...headers.defaultLang,
          ...headers.accessToken(accessToken)
        })
      })
    )
  })
})

test('resolves with whether the code was sent', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ verification_code_sent: false }))

  await expect(client.sendPhoneNumberVerification({ accessToken: 'tkn' })).resolves.toEqual({
    verificationCodeSent: false
  })
})
