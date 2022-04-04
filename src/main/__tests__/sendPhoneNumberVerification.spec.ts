import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { headersTest } from './helpers/identityHelpers'
import { defineWindowProperty } from './helpers/windowHelpers'

beforeAll(() => {
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('send verification for phone number', async () => {
  const { client, domain } = createDefaultTestClient()

  // Given
  const apiCall = fetchMock.mockResponseOnce(JSON.stringify({}))
  const accessToken = '123'

  // When
  await client.sendPhoneNumberVerification({ accessToken })

  // Then
  expect(apiCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-phone-number-verification`, {
    method: 'POST',
    headers: {
      ...headersTest.defaultLang,
      ...headersTest.accessToken(accessToken),
    },
  })
})
