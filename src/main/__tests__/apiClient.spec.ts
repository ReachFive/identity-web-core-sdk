import fetchMock from 'jest-fetch-mock'

import { defineWindowProperty, mockPkceValues, mockPkceWindow } from './testHelpers'
import ApiClient from '../apiClient'
import createEventManager from '../identityEventManager'
import createUrlParser from '../urlParser'
import winchanMocker from './winchanMocker'
import { toQueryString } from '../../utils/queryString'
import { delay } from '../../utils/promise'

const clientId = 'zdfuh'
const domain = 'local.reach5.net'

function createServices(config = {}) {
  const eventManager = createEventManager()
  const urlParser = createUrlParser(eventManager)
  const client = new ApiClient({
    config: {
      clientId,
      domain,
      sso: false,
      pkceEnforced: false,
      ...config
    },
    eventManager,
    urlParser
  })
  return { client, eventManager, urlParser }
}

beforeEach(() => {
  window.fetch = fetchMock as any

  defineWindowProperty('location')
  defineWindowProperty('crypto', mockPkceWindow)

  fetchMock.resetMocks()
  winchanMocker.reset()
})

describe('getSessionInfo', () => {
  test('basic', async () => {
    const { client } = createServices({ sso: true })

    const sessionInfoCall = fetchMock.mockResponseOnce(
      JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        last_login_type: 'password',
        is_authenticated: true,
        has_password: true,
        social_providers: []
      })
    )

    // When
    const result = await client.getSessionInfo()

    // Then
    expect(sessionInfoCall).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/sso/data?` +
        toQueryString({
          client_id: clientId
        }),
      {
        method: 'GET',
        headers: {},
        credentials: 'include'
      }
    )

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })
})

describe('loginFromSession', () => {
  test('with id_token_hint', async () => {
    expect.assertions(1)

    // Given
    const { client } = createServices()
    const idTokenHint = 'idtokencontent'

    // When
    await client.loginFromSession({ idTokenHint })

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      `https://${domain}/oauth/authorize?` +
        toQueryString({
          client_id: clientId,
          response_type: 'token',
          prompt: 'none',
          id_token_hint: idTokenHint,
          scope: 'openid profile email phone',
          display: 'page',
        })
    )
  })

  test('with code authorization', async () => {
    // Given
    const { client } = createServices()
    const redirectUri = 'https://mysite/login/callback'
    const idTokenHint = 'idtokencontent'

    // When
    await client.loginFromSession({
      idTokenHint,
      redirectUri
    })

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      `https://${domain}/oauth/authorize?` +
        toQueryString({
          client_id: clientId,
          response_type: 'code',
          redirect_uri: redirectUri,
          prompt: 'none',
          id_token_hint: idTokenHint,
          scope: 'openid profile email phone',
          display: 'page',
          ...mockPkceValues,
        })
    )
  })

  test('with sso cookie', async () => {
    // Given
    const { client } = createServices({ sso: true })

    // When
    await client.loginFromSession()

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      `https://${domain}/oauth/authorize?` +
        toQueryString({
          client_id: clientId,
          response_type: 'token',
          prompt: 'none',
          scope: 'openid profile email phone',
          display: 'page',
        })
    )
  })

  test('should throw an exception, when sso is disabled, and no id token is sent', async () => {
    // Given
    const { client } = createServices({ sso: false })

    // When
    try {
      await client.loginFromSession()
    } catch (e) {
      // Then
      expect(e).toEqual(
        new Error("Cannot call 'loginFromSession' if SSO is not enabled.")
      )
    }
  })

  test('popup mode is ignored', async () => {
    // Given
    const { client } = createServices()
    const idTokenHint = 'idtokencontent'

    // When
    await client.loginFromSession({
      idTokenHint,
      popupMode: true
    })

    // Then
    expect(window.location.assign).toHaveBeenCalledWith(
      `https://${domain}/oauth/authorize?` +
        toQueryString({
          client_id: clientId,
          response_type: 'token',
          prompt: 'none',
          id_token_hint: idTokenHint,
          scope: 'openid profile email phone',
          display: 'page',
        })
    )
  })
})

describe('parseUrlFragment', () => {
  test('with success url', async () => {
    expect.assertions(3)

    // Given
    const { eventManager, urlParser } = createServices()

    const idToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    eventManager.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    eventManager.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = urlParser.checkUrlFragment(
      'https://example.com/login/callback#' +
        [
          `id_token=${idToken}`,
          `access_token=${accessToken}`,
          `expires_in=${expiresIn}`,
          `token_type=${tokenType}`
        ].join('&')
    )

    await delay(1)

    // Then
    expect(result).toBe(true)
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
    expect(authenticationFailedHandler).not.toHaveBeenCalled()
  })

  test('with error url', async () => {
    expect.assertions(3)

    // Given
    const { eventManager, urlParser } = createServices()

    const error = 'invalid_grant'
    const errorDescription = 'Invalid email or password'
    const errorUsrMsg = 'Invalid email or password'

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    eventManager.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    eventManager.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = urlParser.checkUrlFragment(
      'https://example.com/login/callback#' +
        [`error=${error}`, `error_description=${errorDescription}`, `error_usr_msg=${errorUsrMsg}`].join('&')
    )

    await delay(1)

    // Then
    expect(result).toBe(true)
    expect(authenticatedHandler).not.toHaveBeenCalled()
    expect(authenticationFailedHandler).toHaveBeenCalledWith({
      error,
      errorDescription,
      errorUsrMsg
    })
  })

  test('with url to be ignored', async () => {
    expect.assertions(3)

    // Given
    const { eventManager, urlParser } = createServices()

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    eventManager.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    eventManager.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = urlParser.checkUrlFragment('https://example.com/login/callback#toto=tutu')

    await delay(1)

    // Then
    expect(result).toBe(false)
    expect(authenticatedHandler).not.toHaveBeenCalled()
    expect(authenticationFailedHandler).not.toHaveBeenCalled()
  })
})
