import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient, expectIframeWithParams } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
  document.body.innerHTML = ''
})

describe('checkSession', () => {
  test('basic', async () => {
    const { api, domain, clientId } = createDefaultTestClient({sso: true})

    api.checkSession().catch(err => console.log(err))

    await expectIframeWithParams(domain, {
      client_id: clientId,
      response_type: 'token',
      scope: 'openid profile email phone',
      response_mode: 'web_message',
      prompt: 'none'
    })
  })

  test('with nonce', async () => {
    const { api, domain, clientId } = createDefaultTestClient({sso: true})

    const nonce = 'pizjfoihzefoiaef'

    api.checkSession({
      nonce
    }).catch(err => console.log(err))

    await expectIframeWithParams(domain, {
      client_id: clientId,
      response_type: 'token',
      nonce,
      scope: 'openid profile email phone',
      response_mode: 'web_message',
      prompt: 'none'
    })
  })
})
