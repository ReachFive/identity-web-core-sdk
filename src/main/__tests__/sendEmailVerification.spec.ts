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
      headers: expect.objectContaining({
        ...headers.jsonAndDefaultLang,
        ...headers.accessToken(accessToken)
      }),
      body: JSON.stringify({
        redirect_url: 'http://toto.com',
        return_to_after_email_confirmation: 'http://confirmation.com'
      })
    })
  })
})

test('resolves with whether the email was sent', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ verification_email_sent: true }))

  await expect(client.sendEmailVerification({ accessToken: 'tkn' })).resolves.toEqual({ verificationEmailSent: true })
})
