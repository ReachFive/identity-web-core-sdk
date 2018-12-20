import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './testHelpers'
import { toQueryString } from '../../utils/queryString'
import { delay } from '../../utils/promise'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

describe("checkSession", () => {
  test('basic', async () => {

    const { api, domain, clientId } = createDefaultTestClient({ sso: true })

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

    const { api, domain, clientId } = createDefaultTestClient({ sso: true })

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
