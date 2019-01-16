import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { toQueryString } from '../../lib/queryString'
import { delay } from '../../lib/promise'
import { createClient } from '../main'

const clientId = 'myclientid'
const domain = 'local.reach5.net'

function coreApi() {
  return createClient({
    clientId,
    domain,
    sso: true
  })
}

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
  document.body.innerHTML = ''
})

describe("checkSession", () => {
  test('basic', async () => {

    const api = coreApi()

    api.checkSession().catch(err => console.log(err))

    await delay(10)

    const iframe = document.querySelector('iframe')

    expect(iframe).not.toBeNull()

    if (iframe) { // Make Typescript happy
      expect(iframe.getAttribute('height')).toEqual('0')
      expect(iframe.getAttribute('width')).toEqual('0')
      expect(iframe.getAttribute('src')).toEqual(`https://${domain}/oauth/authorize?` + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'response_mode': 'web_message',
        'prompt': 'none',
      }))
    }
  })

  test('with nonce', async () => {

    const api = coreApi()

    const nonce = 'pizjfoihzefoiaef'

    api.checkSession({ nonce }).catch(err => console.log(err))

    await delay(10)

    const iframe = document.querySelector('iframe')

    expect(iframe).not.toBeNull()

    if (iframe) { // Make Typescript happy
      expect(iframe.getAttribute('height')).toEqual('0')
      expect(iframe.getAttribute('width')).toEqual('0')
      expect(iframe.getAttribute('src')).toEqual(`https://${domain}/oauth/authorize?` + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'nonce': nonce,
        'response_mode': 'web_message',
        'prompt': 'none',
      }))
    }
  })
})
