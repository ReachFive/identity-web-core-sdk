import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('send sms', done => {
  const { api, domain } = createDefaultTestClient()

  const fetch1 = fetchMock.mockResponseOnce(JSON.stringify(''))

  const accessToken = '123';
  const params = {
    accessToken: accessToken
  };

  api.sendVerificationSms(params).then(_ => {
    expect(fetch1).toHaveBeenCalledWith(`https://${domain}/identity/v1/send-phone-number-verification`, {
      method: 'POST',
      headers: {
        ...headers.defaultLang,
        ...headers.accessToken(accessToken)
      }
    })
    done()
  })
})
