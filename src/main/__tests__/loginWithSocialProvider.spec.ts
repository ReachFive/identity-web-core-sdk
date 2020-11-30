import fetchMock from 'jest-fetch-mock'

import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'
import { delay } from '../../utils/promise'
import { toQueryString } from '../../utils/queryString'
import { createDefaultTestClient } from './helpers/clientFactory'
import { popNextRandomString } from './helpers/randomStringMock'
import winchanMocker from './helpers/winchanMocker'

fetchMock.enableMocks()
defineWindowProperty('crypto', mockWindowCrypto)
defineWindowProperty('location')

beforeEach(() => {
  document.body.innerHTML = ''
  jest.resetAllMocks()
  fetchMock.resetMocks()
  popNextRandomString()
})

test('with default auth', async () => {
  const { client, clientId, domain } = createDefaultTestClient()

  await client.loginWithSocialProvider('google', {})

  await delay(1)

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        scope: 'openid profile email phone',
        display: 'page',
        provider: 'google'
      })
  )
})

test('with popup mode', async () => {
  // Given
  const { client, clientId, domain } = createDefaultTestClient()

  const idToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
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
  client.on('authenticated', authenticatedHandler)

  // When
  await client.loginWithSocialProvider('facebook', { popupMode: true })
  await delay(1)

  // Then
  expect(winchanMocker.receivedParams).toEqual({
    url:
      `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        scope: 'openid profile email phone',
        display: 'popup',
        provider: 'facebook'
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
  const { client } = createDefaultTestClient()

  winchanMocker.mockOpenSuccess({
    success: false,
    data: {
      error: 'access_denied',
      error_description: 'The user cancelled the login process',
      error_usr_msg: 'Login cancelled'
    }
  })

  const authenticatedHandler = jest.fn()
  client.on('authenticated', authenticatedHandler)

  const authenticationFailedHandler = jest.fn()
  client.on('authentication_failed', authenticationFailedHandler)

  // When
  await client.loginWithSocialProvider('facebook', { popupMode: true })
  await delay(1)

  // Then
  expect(authenticatedHandler).not.toHaveBeenCalled()

  expect(authenticationFailedHandler).toHaveBeenCalledWith({
    error: 'access_denied',
    errorDescription: 'The user cancelled the login process',
    errorUsrMsg: 'Login cancelled'
  })
})

test('with popup mode with unexpected failure', async () => {
  // Given
  const { client } = createDefaultTestClient()

  winchanMocker.mockOpenError('Saboteur !!!')

  const authenticatedHandler = jest.fn()
  client.on('authenticated', authenticatedHandler)

  const authenticationFailedHandler = jest.fn()
  client.on('authentication_failed', authenticationFailedHandler)

  // When
  await client.loginWithSocialProvider('facebook', { popupMode: true })
  await delay(1)

  // Then
  expect(authenticatedHandler).not.toHaveBeenCalled()

  expect(authenticationFailedHandler).toHaveBeenCalledWith({
    errorDescription: 'Unexpected error occurred',
    error: 'server_error'
  })
})
