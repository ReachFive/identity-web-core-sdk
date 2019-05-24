import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { delay } from '../../utils/promise'
import { toQueryString } from '../../utils/queryString'
import { createDefaultTestClient, headers } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('with default auth', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const signupToken = 'signupToken'

  const fetch1 = fetchMock.mockResponseOnce(
    JSON.stringify({
      id: '1234',
      tkn: signupToken
    })
  )

  let error = null

  // When
  api
    .signup({
      data: {
        givenName: 'John',
        familyName: 'Doe',
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      }
    })
    .catch(err => (error = err))

  await delay(20)

  // Then

  expect(error).toBeNull()
  expect(fetch1).toHaveBeenCalledWith(`https://${domain}/identity/v1/signup`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      data: {
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      }
    })
  })
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        scope: 'openid profile email phone',
        display: 'page',
        tkn: signupToken
      })
  )
})

test('with auth param', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const signupToken = 'signupToken'
  const fetch1 = fetchMock.mockResponseOnce(
    JSON.stringify({
      id: '1234',
      tkn: signupToken
    })
  )
  const redirectUri = 'http://mysite.com/login/callback'

  let error = null

  // When
  api
    .signup({
      data: {
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      },
      auth: {
        redirectUri
      }
    })
    .catch(err => (error = err))

  await delay(20)

  // Then
  expect(error).toBeNull()
  expect(fetch1).toHaveBeenCalledWith(`https://${domain}/identity/v1/signup`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      data: {
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      }
    })
  })
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` +
      toQueryString({
        client_id: clientId,
        response_type: 'code',
        scope: 'openid profile email phone',
        display: 'page',
        redirect_uri: redirectUri,
        tkn: signupToken
      })
  )
})

test('popup mode ignored', async () => {
  // Given
  const { api, clientId, domain } = createDefaultTestClient()

  const signupToken = 'signupToken'
  fetchMock.mockResponseOnce(
    JSON.stringify({
      id: '1234',
      tkn: signupToken
    })
  )

  let error = null

  // When
  api
    .signup({
      data: {
        givenName: 'John',
        familyName: 'Doe',
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      },
      auth: {
        popupMode: true
      }
    })
    .catch(err => (error = err))

  await delay(20)

  // Then
  expect(error).toBeNull()
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/password/callback?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        scope: 'openid profile email phone',
        display: 'page', // Not popup
        tkn: signupToken
      })
  )
})

test('with user error', async () => {
  // Given
  const { api } = createDefaultTestClient()

  const signupFailedHandler = jest.fn()
  api.on('signup_failed', signupFailedHandler)

  const errorCode = 'email_already_exists'
  const errorDescription = 'Email already in use'
  const errorUsrMsg = 'Another account with the same email address already exists'

  const expectedError = {
    error: errorCode,
    errorDescription,
    errorUsrMsg
  }

  fetchMock.mockResponseOnce(
    JSON.stringify({
      error: errorCode,
      error_description: errorDescription,
      error_usr_msg: errorUsrMsg
    }),
    { status: 400 }
  )

  // When
  let error = null
  api
    .signup({
      data: {
        email: 'john.doe@example.com',
        password: 'majefize'
      }
    })
    .catch(err => (error = err))

  await delay(1)

  expect(error).toEqual(expectedError)
  expect(signupFailedHandler).toHaveBeenCalledWith(expectedError)
})

test('with unexpected error', async () => {
  // Given
  const { api } = createDefaultTestClient()

  const signupFailedHandler = jest.fn()
  api.on('signup_failed', signupFailedHandler)

  const expectedError = new Error('Saboteur !!')
  fetchMock.mockRejectOnce(expectedError)

  // When
  let error = null
  api
    .signup({
      data: {
        email: 'john.doe@example.com',
        password: 'majefize'
      }
    })
    .catch(err => (error = err))

  await delay(1)

  expect(error).toEqual(expectedError)
  expect(signupFailedHandler).not.toHaveBeenCalled()
})
