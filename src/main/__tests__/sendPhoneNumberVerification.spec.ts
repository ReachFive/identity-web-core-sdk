import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { headersTest } from './helpers/identityHelpers'
import { defineWindowProperty } from './helpers/windowHelpers'

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

  const apiCall = fetchMock.mockResponseOnce(JSON.stringify({}))
  const accessToken = '123'

  await client.sendPhoneNumberVerification({ accessToken })

  expect(apiCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-phone-number-verification`, {
    method: 'POST',
    headers: {
      ...headersTest.jsonAndDefaultLang,
      ...headersTest.accessToken(accessToken),
    },
  })
})
