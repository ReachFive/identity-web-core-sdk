import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location', { origin: 'https://local.reach5.net', href: 'https://local.reach5.net'})
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  document.body.innerHTML = ''
  jest.resetAllMocks()
  fetchMock.resetMocks()
  jest.spyOn(global, 'fetch').mockImplementation(jest.fn((input) => {
    let response: Response = new Response()
    if(input.toString().endsWith("/oauth/token")) {
      response = new Response(JSON.stringify({accessToken: 'eydfsjklfjdslk'}))
    }
    return Promise.resolve(response)
  }) as jest.Mock)
  jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn(() => {
    window.dispatchEvent(new MessageEvent('message', { source: window, origin: window.location.origin, data: { type: 'authorization_response', response: {code: 'mycode12'}}}))
  }) as jest.Mock)
})

describe('checkSession', () => {
  test('confidential client', async () => {
    const { client } = createDefaultTestClient({ isImplicitFlowForbidden: true, isPublic: false, sso: true})
    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    await client.checkSession({redirectUri: `https://test.fr/callback`, useWebMessage: true })
    expect(authenticatedHandler).toHaveBeenCalledWith({
      code: 'mycode12'
    })
  })
})
