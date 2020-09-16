import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient, defineWindowProperty, expectIframeWithParams, headers } from './testHelpers'
import { delay } from '../../utils/promise'
import { toQueryString } from '../../utils/queryString'

beforeEach(() => {
  window.fetch = fetchMock as any

  defineWindowProperty('location')
})

const defaultScope = 'openid profile email phone'

test('with default auth (using redirect)', async () => {
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
      scope: defaultScope,
      data: {
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      }
    })
  })
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        scope: defaultScope,
        display: 'page',
        tkn: signupToken
      })
  )
})

test('with default auth (using web_message)', async () => {
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
      },
      auth: {
        useWebMessage: true
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
      scope: defaultScope,
      data: {
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      }
    })
  })

  await expectIframeWithParams(domain, {
    client_id: clientId,
    response_type: 'token',
    scope: defaultScope,
    responseMode: 'web_message',
    prompt: 'none',
    tkn: signupToken
  })
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
      scope: defaultScope,
      data: {
        email: 'john.doe@example.com',
        password: 'P@ssw0rd'
      }
    })
  })
  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: defaultScope,
        display: 'page',
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
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'token',
        scope: defaultScope,
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
