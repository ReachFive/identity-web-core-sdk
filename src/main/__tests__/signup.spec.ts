import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/windowHelpers'

beforeAll(() => {
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

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
    errorUsrMsg,
  }

  fetchMock.mockResponseOnce(
    JSON.stringify({
      error: errorCode,
      error_description: errorDescription,
      error_usr_msg: errorUsrMsg,
    }),
    { status: 400 }
  )

  // When
  const promise = client.signup({
    data: {
      email: 'john.doe@example.com',
      password: 'majefize',
    },
  })

  // Then
  await expect(promise).rejects.toEqual(expectedError)
  expect(signupFailedHandler).toHaveBeenCalledWith(expectedError)
})

test('with unexpected error', async () => {
  // Given
  const { client } = createDefaultTestClient()

  const signupFailedHandler = jest.fn()
  client.on('signup_failed', signupFailedHandler)

  const expectedError = new Error('[fake error: ignore me]')
  fetchMock.mockRejectOnce(expectedError)

  // When
  const promise = client.signup({
    data: {
      email: 'john.doe@example.com',
      password: 'majefize',
    },
  })

  await expect(promise).rejects.toThrow(expectedError)
  expect(signupFailedHandler).not.toHaveBeenCalled()
})
