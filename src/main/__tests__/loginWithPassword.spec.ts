import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { createClient } from '../main'
import { toQueryString } from '../../lib/queryString'
import { delay } from '../../lib/promise'


const clientId = 'myclientid'

function coreApi() {
  const conf = {
    clientId: clientId,
    domain: 'local.reach5.net'
  }

  // Mocks the initial config fetching
  fetchMock.mockResponseOnce(JSON.stringify(conf), { status: 200 })

  return createClient(conf)
}

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('with default auth', async () => {
  // Given
  const api = coreApi()

  const email = 'john.doe@example.com'
  const password = 'izDf8£Zd'

  const passwordToken = 'password_token'

  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({
    tkn: passwordToken
  }))

  // When
  let error = null
  api.loginWithPassword({ email, password }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()

  expect(passwordLoginCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/password/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: `{"client_id":"${clientId}","email":"${email}","password":"${password}"}`
  })

  expect(window.location.assign).toHaveBeenCalledWith(
    'https://local.reach5.net/identity/v1/password/callback?' + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid profile email phone',
      'display': 'page',
      'tkn': passwordToken
    })
  )
})

test('popup mode is ignored', async () => {
  // Given
  const api = coreApi()

  const email = 'john.doe@example.com'
  const password = 't7k$kA6n'

  const passwordToken = 'password_token_2'
  const redirectUri = 'http://mysite.com/login/callback'

  fetchMock.mockResponseOnce(JSON.stringify({
    tkn: passwordToken
  }))

  // When
  let error = null

  api.loginWithPassword(
    {
      email,
      password,
      auth: {
        redirectUri: redirectUri,
        popupMode: true
      }
    }
  ).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith(
    'https://local.reach5.net/identity/v1/password/callback?' + toQueryString({
      'client_id': clientId,
      'response_type': 'code',
      'scope': 'openid profile email phone',
      'display': 'page',
      'redirect_uri': redirectUri,
      'tkn': passwordToken
    })
  )
})

test('with default auth', async () => {
  // Given
  const api = coreApi()

  const email = 'john.doe@example.com'
  const password = 'izDf8£Zd'

  const passwordToken = 'password_token'

  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({
    tkn: passwordToken
  }))

  // When
  let error = null

  api.loginWithPassword(
    {
      email,
      password,
      auth: {
        fetchBasicProfile: false,
        scope: ['openid', 'email']
      }
    }
  ).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()

  expect(passwordLoginCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/password/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: `{"client_id":"${clientId}","email":"${email}","password":"${password}"}`
  })

  expect(window.location.assign).toHaveBeenCalledWith(
    'https://local.reach5.net/identity/v1/password/callback?' + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid email',
      'display': 'page',
      'tkn': passwordToken
    })
  )
})

test('with user error', async () => {
  // Given
  const api = coreApi()

  const loginFailedHandler = jest.fn()
  api.on('login_failed', loginFailedHandler)

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
  let error = null
  api.loginWithPassword(
    {
      email: 'john.doe@example.com',
      password: 'majefize'
    }
  ).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toEqual(expectedError)
  expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
})