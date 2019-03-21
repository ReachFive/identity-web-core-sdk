import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('simple', done => {

  const { api, clientId, domain } = createDefaultTestClient()

  const fetch1 = fetchMock.mockResponseOnce('', {
    status: 204
  })

  const email = 'john.doe@example.com'

  api.requestPasswordReset({ email })
    .then(_ => {
      expect(fetch1).toHaveBeenCalledWith(`https://${domain}/identity/v1/forgot-password`, {
        method: 'POST',
        headers: headers.jsonAndDefaultLang,
        body: JSON.stringify({
          'client_id': clientId,
          email
        })
      })
      done()
    })
})
