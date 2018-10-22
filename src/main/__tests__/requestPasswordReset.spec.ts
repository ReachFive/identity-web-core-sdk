
import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { createClient } from '../main'


const clientId = 'jzidvJ'

function coreApi() {
  const conf = {
    clientId: clientId,
    domain: 'local.reach5.net'
  }

  // Mocks the initial config fetching
  fetchMock.mockResponseOnce(JSON.stringify(conf), { status: 200 })

  return createClient(conf)
}

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('simple', done => {

  const api = coreApi()

  const fetch1 = fetchMock.mockResponseOnce('', {
    status: 204
  })

  const email = 'john.doe@example.com'

  api.requestPasswordReset({ email })
    .then(_ => {
      expect(fetch1).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          'client_id': clientId,
          email
        })
      })
      done()
    })
})