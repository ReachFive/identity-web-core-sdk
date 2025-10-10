import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './helpers/clientFactory'
import { tkn } from './helpers/oauthHelpers'
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
    if(input.toString().endsWith("/password/login")){
      response = new Response(JSON.stringify(tkn), {
        status: 200
      })
    }
    else if(input.toString().endsWith("/oauth/token")) {
      response = new Response(JSON.stringify({accessToken: 'eydfsjklfjdslk'}))
    }
    return Promise.resolve(response)
  }) as jest.Mock)

  jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn(() => {
    window.dispatchEvent(new MessageEvent('message', { source: window, origin: window.location.origin, data: { type: 'authorization_response', response: {code: 'mycode12'}}}))
  }) as jest.Mock)

})

describe('useWebMessage: true', () => {
  test('confidential client', async () => {
    console.log("inside test loginWithPassword")
    const { client } = createDefaultTestClient({ isImplicitFlowForbidden: true, isPublic: false })
    const email = 'john.doe@example.com'
    const password = 'izDf8£Zd'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    await client.loginWithPassword({
      email,
      password,
      auth: {
        redirectUri: `https://test.fr/callback`,
        useWebMessage: true
      }
    })
    expect(authenticatedHandler).toHaveBeenCalledWith({
      code: 'mycode12'
    })
  })

  test('public client', async () => {
    const { client } = createDefaultTestClient({ isImplicitFlowForbidden: true, isPublic: true })
    const email = 'john.doe@example.com'
    const password = 'izDf8£Zd'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    await client.loginWithPassword({
      email,
      password,
      auth: {
        redirectUri: `https://test.fr/callback`,
        useWebMessage: true
      }
    })
    expect(authenticatedHandler).toHaveBeenCalledWith({
      accessToken: 'eydfsjklfjdslk'
    })
  })
})

describe('error cases', () => {
  test('[login_failed] invalid credentials', async () => {
    const { client } = createDefaultTestClient()

    // Given
    const loginFailedHandler = jest.fn()
    client.on('login_failed', loginFailedHandler)

    const expectedError = {
      error: 'invalid_grant',
      errorDescription: 'Invalid email or password',
      errorUsrMsg: 'Invalid email or password'
    }

    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid email or password',
        error_usr_msg: 'Invalid email or password'
      }),
      { status: 400 }
    )

    // When
    const promise = client.loginWithPassword({ email: 'john.doe@example.com', password: 'majefize' })

    // Then
    await expect(promise).rejects.toEqual(expectedError)
    await expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
  })
})
