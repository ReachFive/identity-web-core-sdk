import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient, defineWindowProperty, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock as any

  defineWindowProperty('location')
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

  api.sendEmailVerification(params).then(_ => {
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
