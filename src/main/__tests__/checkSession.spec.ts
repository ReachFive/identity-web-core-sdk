import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient, defineWindowProperty, expectIframeWithParams, mockPkceValues, mockPkceWindow } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock as any

  defineWindowProperty('location')
  defineWindowProperty('crypto', mockPkceWindow)

  document.body.innerHTML = ''
})

describe('checkSession', () => {
  test('basic', async () => {
    const { api, domain, clientId } = createDefaultTestClient({ sso: true })

    api.checkSession().catch(err => console.log(err))

    await expectIframeWithParams(
      domain,
      {
        client_id: clientId,
        response_type: 'code',
        scope: 'openid profile email phone',
        response_mode: 'web_message',
        prompt: 'none',
        ...mockPkceValues,
      },
    )
  })

  test('with nonce', async () => {
    const { api, domain, clientId } = createDefaultTestClient({ sso: true })

    const nonce = 'pizjfoihzefoiaef'

    api.checkSession({
      nonce
    }).catch(err => console.log(err))

    await expectIframeWithParams(
      domain,
      {
        client_id: clientId,
        response_type: 'code',
        nonce,
        scope: 'openid profile email phone',
        response_mode: 'web_message',
        prompt: 'none',
        ...mockPkceValues,
      },
    )
  })
})
