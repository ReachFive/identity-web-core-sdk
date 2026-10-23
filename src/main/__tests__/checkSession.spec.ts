import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location', { origin: 'https://local.reach5.net', href: 'https://local.reach5.net' })
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  document.body.innerHTML = ''
  jest.resetAllMocks()
  fetchMock.resetMocks()
  jest.spyOn(global, 'fetch').mockImplementation(
    jest.fn((input) => {
      let response: Response = new Response()
      if (input.toString().endsWith('/oauth/token')) {
        response = new Response(JSON.stringify({ accessToken: 'eydfsjklfjdslk' }))
      }
      return Promise.resolve(response)
    }) as jest.Mock
  )
  jest.spyOn(document.body, 'appendChild').mockImplementation(
    jest.fn(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          origin: window.location.origin,
          data: { type: 'authorization_response', response: { code: 'mycode12' } }
        })
      )
    }) as jest.Mock
  )
})

describe('checkSession', () => {
  test('confidential client', async () => {
    const { client } = createDefaultTestClient({ isImplicitFlowForbidden: true, isPublic: false, sso: true })
    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    await client.checkSession({ redirectUri: `https://test.fr/callback`, useWebMessage: true })
    expect(authenticatedHandler).toHaveBeenCalledWith({
      code: 'mycode12'
    })
  })

  test('rejects with the error redirected to the redirect URI, and stops listening', async () => {
    const { client } = createDefaultTestClient({ isImplicitFlowForbidden: true, isPublic: false, sso: true })
    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)
    jest.spyOn(document.body, 'appendChild').mockImplementationOnce(
      jest.fn((iframe: HTMLIFrameElement) => {
        // The frame followed the redirection to the redirect URI, of the same origin as the page
        Object.defineProperty(iframe, 'contentWindow', {
          value: { location: { search: '?error=login_required&error_description=No+session', hash: '' } }
        })
        iframe.dispatchEvent(new Event('load'))
        return iframe
      }) as jest.Mock
    )

    await expect(client.checkSession({ redirectUri: `https://test.fr/callback`, useWebMessage: true })).rejects.toEqual(
      { error: 'login_required', errorDescription: 'No session' }
    )

    // A later message is no longer listened to
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: 'authorization_response', response: { code: 'late-code' } }
      })
    )
    expect(authenticatedHandler).not.toHaveBeenCalled()
  })
})
