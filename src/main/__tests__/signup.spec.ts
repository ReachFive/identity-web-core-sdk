import fetchMock from 'jest-fetch-mock'

import {
  defineWindowProperty,
  headers,
  mockWindowCrypto
} from './helpers/testHelpers'
import { delay } from '../../utils/promise'
import { createDefaultTestClient, TestKit } from './helpers/clientFactory'
import { scope, tkn } from './helpers/oauthHelpers'
import { SignupParams } from '../apiClient'
import { snakeCaseProperties } from '../../utils/transformObjectProperties'

fetchMock.enableMocks()
defineWindowProperty('location')
defineWindowProperty('crypto', mockWindowCrypto)

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

export async function signupTest(testkit: TestKit, params: SignupParams) {
  const { client, clientId, domain } = testkit

  // Given
  const signupCall = fetchMock.mockResponseOnce(
    JSON.stringify({
      id: '1234',
      ...tkn,
    })
  )

  // When
  await client.signup(params)
  await delay(5)

  expect(signupCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/signup`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      ...scope,
      data: snakeCaseProperties(params.data),
    })
  })
}

test('with user error', async () => {
  // Given
  const { client } = createDefaultTestClient()

  const signupFailedHandler = jest.fn()
  client.on('signup_failed', signupFailedHandler)

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
  await client
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
  const { client } = createDefaultTestClient()

  const signupFailedHandler = jest.fn()
  client.on('signup_failed', signupFailedHandler)

  const expectedError = new Error('Saboteur !!')
  fetchMock.mockRejectOnce(expectedError)

  // When
  let error = null
  await client
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
