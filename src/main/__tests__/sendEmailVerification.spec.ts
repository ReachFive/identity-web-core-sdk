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

test('send verification for email', async () => {
  const { client, domain } = createDefaultTestClient()

  // Given
  const apiCall = fetchMock.mockResponseOnce(JSON.stringify({}))
  const accessToken = '456'
  const params = {
    accessToken,
    redirectUrl: 'http://toto.com',
    returnToAfterEmailConfirmation: 'http://confirmation.com',
  }

  // When
  await client.sendEmailVerification(params)

  // Then
  expect(apiCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-email-verification`, {
    method: 'POST',
    headers: {
      ...headersTest.jsonAndDefaultLang,
      ...headersTest.accessToken(accessToken),
    },
    body: JSON.stringify({
      redirect_url: 'http://toto.com',
      return_to_after_email_confirmation: 'http://confirmation.com',
    }),
  })
})
