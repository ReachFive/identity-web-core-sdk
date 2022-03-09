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

test('send verification mail', async () => {
  const { client, domain } = createDefaultTestClient()

  const apiCall = fetchMock.mockResponseOnce(JSON.stringify(''))

  const accessToken = '456'
  const params = {
    accessToken,
    redirectUrl: 'http://toto.com',
    returnToAfterEmailConfirmation: 'http://confirmation.com'
  }

  client.sendEmailVerification(params).then(() => {
    expect(apiCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-email-verification`, {
      method: 'POST',
      headers: {
        ...headers.jsonAndDefaultLang,
        ...headers.accessToken(accessToken)
      },
      body: JSON.stringify({
        redirect_url: 'http://toto.com',
        return_to_after_email_confirmation: 'http://confirmation.com'
      })
    })
  })
})
