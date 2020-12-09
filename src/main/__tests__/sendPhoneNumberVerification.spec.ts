import fetchMock from 'jest-fetch-mock'
import { defineWindowProperty, headers } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'

beforeAll(() => {
  fetchMock.enableMocks()
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
    expect(apiCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-phone-number-verification`, {
      method: 'POST',
      headers: {
        ...headers.defaultLang,
        ...headers.accessToken(accessToken)
      }
    })
  })
})
