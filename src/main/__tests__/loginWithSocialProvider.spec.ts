import { delay } from "../../utils/promise"
import { toQueryString } from "../../utils/queryString"
import winchanMocker from './winchanMocker'
import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('with default auth', async () => {
  const { api, clientId, domain } = createDefaultTestClient()

  let error = null
  api.loginWithSocialProvider('google', {}).catch(err => error = err)

  await delay(1)

  expect(error).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid profile email phone',
      'display': 'page',
      'provider': 'google'
    })
  )
})

test('with auth params', async () => {
  const { api, clientId, domain } = createDefaultTestClient()

  let error = null

  const redirectUri = 'http://mysite.com/login/callback'

  api.loginWithSocialProvider('linkedin', { redirectUri }).catch(err => error = err)

  await delay(1)

  expect(error).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` + toQueryString({
      'client_id': clientId,
      'response_type': 'code',
      'scope': 'openid profile email phone',
      'display': 'page',
      'redirect_uri': redirectUri,
      'provider': 'linkedin'
    })
  )
});

test('with access token auth param', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const accessToken = 'myAccessToken'

  // When
  let error = null
  api.loginWithSocialProvider('paypal', { accessToken }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid profile email phone',
      'display': 'page',
      'access_token': accessToken,
      'provider': 'paypal'
    })
  )
})

test('with popup mode', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
  const accessToken = 'kjbsdfljndvlksndfv'
  const expiresIn = 1800
  const tokenType = 'Bearer'

  winchanMocker.mockOpenSuccess({
    success: true,
    data: {
      id_token: idToken,
      access_token: accessToken,
      expires_in: expiresIn,
      token_type: tokenType
    }
  })

  const authenticatedHandler = jest.fn()
  api.on('authenticated', authenticatedHandler)

  // When
  let error = null
  await api.loginWithSocialProvider('facebook', { popupMode: true }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()
  expect(winchanMocker.receivedParams).toEqual({
    url: `https://${domain}/oauth/authorize?` + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid profile email phone',
      'display': 'popup',
      'provider': 'facebook'
    }),
    relay_url: `https://${domain}/popup/relay`,
    window_features: 'menubar=0,toolbar=0,resizable=1,scrollbars=1,width=0,height=0,top=0,left=0'
  })

  await delay(5)

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

test('with popup mode with expected failure', async () => {
  // Given
  const { api } = createDefaultTestClient()

  winchanMocker.mockOpenSuccess({
    success: false,
    data: {
      error: 'access_denied',
      error_description: 'The user cancelled the login process',
      error_usr_msg: 'Login cancelled'
    }
  })

  const authenticatedHandler = jest.fn()
  api.on('authenticated', authenticatedHandler)

  const authenticationFailedHandler = jest.fn()
  api.on('authentication_failed', authenticationFailedHandler)

  // When
  let error = null
  await api.loginWithSocialProvider('facebook', { popupMode: true }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()
  expect(authenticatedHandler).not.toHaveBeenCalled()

  expect(authenticationFailedHandler).toHaveBeenCalledWith({
    error: 'access_denied',
    errorDescription: 'The user cancelled the login process',
    errorUsrMsg: 'Login cancelled'
  })
})

test('with popup mode with unexpected failure', async () => {
  // Given
  const { api } = createDefaultTestClient()

  winchanMocker.mockOpenError('Saboteur !!!')

  const authenticatedHandler = jest.fn()
  api.on('authenticated', authenticatedHandler)

  const authenticationFailedHandler = jest.fn()
  api.on('authentication_failed', authenticationFailedHandler)

  // When
  let error = null
  await api.loginWithSocialProvider('facebook', { popupMode: true }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()
  expect(authenticatedHandler).not.toHaveBeenCalled()

  expect(authenticationFailedHandler).toHaveBeenCalledWith({
    errorDescription: 'Unexpected error occurred',
    error: 'server_error'
  })
})