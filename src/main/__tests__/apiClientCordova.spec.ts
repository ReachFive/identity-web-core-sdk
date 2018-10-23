import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import ApiClient, { Events } from '../apiClient'
import EventManager from '../../lib/eventManager'
import { delay } from '../../lib/promise'
import { toQueryString } from '../../lib/queryString'


const clientId = 'kqIJE'

function apiClient() {
  const eventManager = new EventManager<Events>()

  return new ApiClient({
    clientId: clientId,
    domain: 'local.reach5.net'
  }, eventManager)
}

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn() as any
  (window as any).cordova = {}
  delete window.handleOpenURL
  fetchMock.resetMocks()
})

describe('signup', () => {
  test('with default auth', async () => {

    // Given
    const client = apiClient()

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    const signupCall = fetchMock.mockResponseOnce(JSON.stringify({
      'id_token': idToken,
      'access_token': accessToken,
      'expires_in': expiresIn,
      'token_type': tokenType
    }))

    const email = 'john.doe@example.com'
    const password = 'Jab$p9jh'
    const givenName = 'John'
    const familyName = 'Doe'

    // When

    await client.signup({
      data: {
        email,
        password,
        givenName,
        familyName
      }
    })

    // Then

    expect(signupCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/signup-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({
        'client_id': clientId,
        'scope': 'openid profile email phone',
        'data': {
          'email': email,
          'password': password,
          'given_name': givenName,
          'family_name': familyName
        }
      })
    })

    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
  })

  test('with origin', async () => {

    // Given
    const client = apiClient()

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    const origin = 'foobar'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    const signupCall = fetchMock.mockResponseOnce(JSON.stringify({
      'id_token': idToken,
      'access_token': accessToken,
      'expires_in': expiresIn,
      'token_type': tokenType
    }))

    const email = 'john.doe@example.com'
    const password = 'Jab$p9jh'
    const givenName = 'John'
    const familyName = 'Doe'

    // When
    await client.signup({
      data: {
        email,
        password,
        givenName,
        familyName
      },
      auth: {
        origin
      }
    })

    // Then
    expect(signupCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/signup-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({
        'client_id': clientId,
        'scope': 'openid profile email phone',
        'origin': origin,
        'data': {
          'email': email,
          'password': password,
          'given_name': givenName,
          'family_name': familyName
        }
      })
    })

    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
  })

  test('with user error', async () => {

    // Given
    const client = apiClient()

    const signupFailedHandler = jest.fn()
    client.on('signup_failed', signupFailedHandler)

    const error = 'email_already_exists'
    const errorDescription = 'Email already in use'
    const errorUsrMsg = 'Another account with the same email address already exists'

    const expectedError = {
      error,
      errorDescription,
      errorUsrMsg
    }

    fetchMock.mockResponseOnce(JSON.stringify({
      error: error,
      error_description: errorDescription,
      error_usr_msg: errorUsrMsg
    }), { status: 400 })

    // When
    try {
      await client.signup({
        data: {
          email: 'john.doe@example.com',
          password: 'majefize'
        }
      })
    } catch (e) {
      // Then
      expect(e).toEqual(expectedError)
    }

    expect(signupFailedHandler).toHaveBeenCalledWith(expectedError)
  })

  test('with unexpected error', async () => {
    expect.assertions(2)

    // Given
    const client = apiClient()

    const signupFailedHandler = jest.fn()
    client.on('signup_failed', signupFailedHandler)

    const error = new Error('Saboteur !!')

    fetchMock.mockRejectOnce(error)

    // When
    try {
      await client.signup({
        data: {
          email: 'john.doe@example.com',
          password: 'majefize'
        }
      })
    } catch (e) {
      // Then
      expect(e).toEqual(error)
    }

    expect(signupFailedHandler).not.toHaveBeenCalled()
  })
})

describe('loginWithPassword', async () => {
  test('with default auth', async () => {
    expect.assertions(2)

    // Given
    const client = apiClient()

    const email = 'john.doe@example.com'
    const password = 'izDf8£Zd'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({
      'id_token': idToken,
      'access_token': accessToken,
      'expires_in': expiresIn,
      'token_type': tokenType
    }))

    // When
    await client.loginWithPassword({
      email,
      password
    })

    // Then

    expect(passwordLoginCall).toHaveBeenCalledWith('https://local.reach5.net/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({
        client_id: clientId,
        grant_type: 'password',
        username: email,
        password,
        scope: 'openid profile email phone'
      })
    })

    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
  })

  test('with origin', async () => {
    expect.assertions(2)

    // Given
    const client = apiClient()

    const email = 'john.doe@example.com'
    const password = 'izDf8£Zd'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800

    const origin = 'my_origin'

    const tokenType = 'Bearer'
    const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({
      'id_token': idToken,
      'access_token': accessToken,
      'expires_in': expiresIn,
      'token_type': tokenType
    }))

    // When
    await client.loginWithPassword({
      email,
      password,
      auth: { origin }
    })

    // Then

    expect(passwordLoginCall).toHaveBeenCalledWith('https://local.reach5.net/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({
        client_id: clientId,
        grant_type: 'password',
        username: email,
        password,
        scope: 'openid profile email phone',
        origin
      })
    })

    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
  })

  test('redirect uri ignored', async () => {
    // Given
    const client = apiClient()

    const email = 'john.doe@example.com'
    const password = 'izDf8£Zd'

    const authenticatedHandler = jest.fn()
    client.on('authenticated', authenticatedHandler)

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800

    const tokenType = 'Bearer'
    const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({
      'id_token': idToken,
      'access_token': accessToken,
      'expires_in': expiresIn,
      'token_type': tokenType
    }))

    // When
    await client.loginWithPassword({
      email,
      password,
      auth: {
        redirectUri: 'http://mysite.com/login/callback'
      }
    })

    // Then

    expect(passwordLoginCall).toHaveBeenCalledWith('https://local.reach5.net/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({
        client_id: clientId,
        grant_type: 'password',
        username: email,
        password,
        scope: 'openid profile email phone'
      })
    })

    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })

  })

  test('with user error', async () => {
    // Given
    const client = apiClient()

    const loginFailedHandler = jest.fn()
    client.on('login_failed', loginFailedHandler)

    const expectedError = {
      error: 'invalid_grant',
      errorDescription: 'Invalid email or password',
      errorUsrMsg: 'Invalid email or password'
    }

    fetchMock.mockResponseOnce(JSON.stringify({
      'error': 'invalid_grant',
      'error_description': 'Invalid email or password',
      'error_usr_msg': 'Invalid email or password'
    }), { status: 400 })

    // When
    try {
      await client.loginWithPassword({
        email: 'john.doe@example.com',
        password: 'majefize'
      })
    } catch (e) {
      expect(e).toEqual(expectedError)
    }

    expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
  })
})

describe('loginWithSocialProvider', () => {

  test('with browsertab plugin present and available', async () => {
    expect.assertions(3)

    // Given
    const client = apiClient()

    let calledUrl = null

    window.cordova = {
      plugins: {
        browsertab: {
          openUrl: jest.fn().mockImplementation((url, success) => {
            calledUrl = url
            success()
          }),
          close() {},
          isAvailable: jest.fn().mockImplementation(resolve => resolve(true))
        }
      }
    }

    // When
    await client.loginWithSocialProvider('facebook')

    // Then
    expect(window.cordova.plugins!.browsertab!.isAvailable).toHaveBeenCalledTimes(1)
    expect(window.cordova.plugins!.browsertab!.openUrl).toHaveBeenCalledTimes(1)

    expect(calledUrl).toEqual(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'provider': 'facebook'
      })
    )
  })

  test('with browsertab plugin present and but not available', async () => {
    expect.assertions(3)

    // Given
    const client = apiClient()

    window.cordova = {
      plugins: {
        browsertab: {
          openUrl: jest.fn().mockImplementation((_url, _success, error) => {
            error(new Error('Not available'))
          }),
          close() {},
          isAvailable: jest.fn().mockImplementation(resolve => resolve(false))
        }
      },
      InAppBrowser: {
        open: jest.fn()
      }
    }

    // When
    await client.loginWithSocialProvider('facebook')

    // Then
    expect(window.cordova.plugins!.browsertab!.isAvailable).toHaveBeenCalledTimes(1)
    expect(window.cordova.plugins!.browsertab!.openUrl).not.toHaveBeenCalled()

    expect(window.cordova.InAppBrowser!.open).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'provider': 'facebook'
      }),
      '_system'
    )
  })

  test('with browsertab plugin not present', async () => {
    expect.assertions(1)

    // Given
    const client = apiClient()

    window.cordova = {
      InAppBrowser: {
        open: jest.fn()
      }
    }

    // When
    await client.loginWithSocialProvider('facebook')

    // Then
    expect(window.cordova.InAppBrowser!.open).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'provider': 'facebook'
      }),
      '_system'
    )
  })

  test('error when InAppBrowser plugin is not present', async () => {
    expect.assertions(1)

    // Given
    const client = apiClient()

    // When
    try {
      await client.loginWithSocialProvider('facebook')
    } catch (e) {
      // Then
      expect(e).toEqual(
        new Error('Cordova plugin "inappbrowser" is required.')
      )
    }
  })

  test('with specified auth params', async () => {
    expect.assertions(1)

    // Given
    const client = apiClient()

    const redirectUri = 'myapp://login/callback'

    window.cordova = {
      InAppBrowser: {
        open: jest.fn()
      }
    }

    // When
    await client.loginWithSocialProvider('facebook', {
      redirectUri: redirectUri
    })

    // Then
    expect(window.cordova.InAppBrowser!.open).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'code',
        'scope': 'openid profile email phone',
        'display': 'page',
        'redirect_uri': redirectUri,
        'provider': 'facebook'
      }),
      '_system'
    )
  })

  test('popup mode is ignored', async () => {
    expect.assertions(1)

    // Given
    const client = apiClient()

    window.cordova = {
      InAppBrowser: {
        open: jest.fn()
      }
    }

    // When
    await client.loginWithSocialProvider('facebook', {
      popupMode: true
    })

    // Then
    expect(window.cordova.InAppBrowser!.open).toHaveBeenCalledWith(
      'https://local.reach5.net/oauth/authorize?' + toQueryString({
        'client_id': clientId,
        'response_type': 'token',
        'scope': 'openid profile email phone',
        'display': 'page',
        'provider': 'facebook'
      }),
      '_system'
    )
  })
})

describe('handleOpenURL', () => {

  test('when defined by the sdk', async () => {
    // Given
    const client = apiClient()

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    // When
    const authenticatedHandler = jest.fn().mockName('authenticationHandler')
    client.on('authenticated', authenticatedHandler)

    window.handleOpenURL!('myapp://login/callback#' + [
      `id_token=${idToken}`,
      `access_token=${accessToken}`,
      `expires_in=${expiresIn}`,
      `token_type=${tokenType}`
    ].join('&'))

    await delay(1)

    // Then
    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
  })

  test('when already defined outside', async () => {
    expect.assertions(2)

    // Given
    const handleOpenURL = jest.fn()
    window.handleOpenURL = handleOpenURL

    const client = apiClient()

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    // When
    const authenticatedHandler = jest.fn().mockName('authenticationHandler')
    client.on('authenticated', authenticatedHandler)

    window.handleOpenURL('myapp://login/callback#' + [
      `id_token=${idToken}`,
      `access_token=${accessToken}`,
      `expires_in=${expiresIn}`,
      `token_type=${tokenType}`
    ].join('&'))

    await delay(1)

    // Then
    expect(handleOpenURL).toHaveBeenCalled()
    expect(authenticatedHandler).not.toHaveBeenCalled()
  })

  test('with browsertab plugin', async () => {
    expect.assertions(2)

    // Given
    const client = apiClient()

    window.cordova = {
      plugins: {
        browsertab: {
          openUrl: jest.fn(),
          close: jest.fn(),
          isAvailable: jest.fn()
        }
      }
    }

    const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    // When
    const authenticatedHandler = jest.fn().mockName('authenticationHandler')
    client.on('authenticated', authenticatedHandler)

    window.handleOpenURL!('myapp://login/callback#' + [
      `id_token=${idToken}`,
      `access_token=${accessToken}`,
      `expires_in=${expiresIn}`,
      `token_type=${tokenType}`
    ].join('&'))

    await delay(1)

    // Then
    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe'
      },
      accessToken,
      expiresIn,
      tokenType
    })
    expect(window.cordova.plugins!.browsertab!.close).toHaveBeenCalled()
  })
})