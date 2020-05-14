import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('send mail', done => {
  const { api, domain } = createDefaultTestClient()

  const fetch1 = fetchMock.mockResponseOnce(JSON.stringify(''))

  const accessToken = '456'
  const params = {
    accessToken,
    redirectUrl: 'http://toto.com',
    returnToAfterEmailConfirmation: 'http://confirmation.com'
  }

  const body = {
    redirect_url: 'http://toto.com',
    return_to_after_email_confirmation: 'http://confirmation.com'
  }

  api.sendVerificationEmail(params).then(_ => {
    expect(fetch1).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-email-verification`, {
      method: 'POST',
      headers: {
        ...headers.jsonAndDefaultLang,
        ...headers.accessToken(accessToken)
      },
      body: JSON.stringify(body)
    })
    done()
  })
})
