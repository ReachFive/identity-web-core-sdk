import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock as any

  Object.defineProperty(window, 'location', {
    writable: true,
    value: { assign: jest.fn() }
  })
})

test('send verification for phone number', done => {
  const { api, domain } = createDefaultTestClient()

  const fetch1 = fetchMock.mockResponseOnce(JSON.stringify(''))

  const accessToken = '123'
  const params = {
    accessToken
  }

  api.sendPhoneNumberVerification(params).then(_ => {
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
