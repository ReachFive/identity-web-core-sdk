import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { toQueryString } from '../../utils/queryString'
import { delay } from '../../utils/promise'
import { createDefaultTestClient, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('Login with default auth config (email/password)', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const email = 'john.doe@example.com'
  const password = 'izDf8£Zd'

  const passwordToken = 'password_token'
  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({ tkn: passwordToken }))

  // When
  let error = null
  api.loginWithPassword({ email, password }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()

  expect(passwordLoginCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/password/login`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: `{"client_id":"${clientId}","email":"${email}","password":"${password}"}`
  })

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid profile email phone',
      'display': 'page',
      'tkn': passwordToken
    })
  )
})

test('Login with default auth config (phone/password)', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const phoneNumber = '+33761331332'
  const password = 'izDf8£Zd'

  const passwordToken = 'password_token'
  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({ tkn: passwordToken }))

  // When
  let error = null
  api.loginWithPassword({ phoneNumber, password }).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()

  expect(passwordLoginCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/password/login`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: `{"client_id":"${clientId}","phone_number":"${phoneNumber}","password":"${password}"}`
  })

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid profile email phone',
      'display': 'page',
      'tkn': passwordToken
    })
  )
})

test('Login with popup mode (email/password)', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const email = 'john.doe@example.com'
  const password = 't7k$kA6n'

  const passwordToken = 'password_token_2'
  const redirectUri = 'http://mysite.com/login/callback'

  fetchMock.mockResponseOnce(JSON.stringify({ tkn: passwordToken }))

  // When
  let error = null

  api.loginWithPassword(
    {
      email,
      password,
      auth: {
        redirectUri,
        popupMode: true
      }
    }
  ).catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` + toQueryString({
      'client_id': clientId,
      'response_type': 'code',
      'scope': 'openid profile email phone',
      'display': 'page',
      'redirect_uri': redirectUri,
      'tkn': passwordToken
    })
  )
})

test('Login with default auth (email/password)', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const email = 'john.doe@example.com'
  const password = 'izDf8£Zd'

  const passwordToken = 'password_token'
  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({ tkn: passwordToken }))

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

  expect(passwordLoginCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/password/login`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: `{"client_id":"${clientId}","email":"${email}","password":"${password}"}`
  })

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` + toQueryString({
      'client_id': clientId,
      'response_type': 'token',
      'scope': 'openid email',
      'display': 'page',
      'tkn': passwordToken
    })
  )
})

test('Don\'t login if the password is wrong (email/password)', async () => {
  // Given
  const { api } = createDefaultTestClient()

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
  api
    .loginWithPassword({ email: 'john.doe@example.com', password: 'majefize' })
    .catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toEqual(expectedError)
  expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
})

test('Don\'t login if the password is wrong (phone number/password)', async () => {
  // Given
  const { api } = createDefaultTestClient()

  const loginFailedHandler = jest.fn()
  api.on('login_failed', loginFailedHandler)

  const expectedError = {
    error: 'invalid_grant',
    errorDescription: 'Invalid phone number or password',
    errorUsrMsg: 'Invalid phone number or password'
  }

  fetchMock.mockResponseOnce(JSON.stringify({
    'error': 'invalid_grant',
    'error_description': 'Invalid phone number or password',
    'error_usr_msg': 'Invalid phone number or password'
  }), { status: 400 })

  // When
  let error = null
  api
    .loginWithPassword({ phoneNumber: '+33761331332', password: 'majefize' })
    .catch(err => error = err)

  await delay(1)

  // Then
  expect(error).toEqual(expectedError)
  expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
})
