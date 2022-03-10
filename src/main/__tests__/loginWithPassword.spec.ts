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

describe('error cases', () => {
  test('[login_failed] invalid credentials', async () => {
    const { client } = createDefaultTestClient()

    // Given
    const loginFailedHandler = jest.fn()
    client.on('login_failed', loginFailedHandler)

    const expectedError = {
      error: 'invalid_grant',
      errorDescription: 'Invalid email or password',
      errorUsrMsg: 'Invalid email or password',
    }

    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid email or password',
        error_usr_msg: 'Invalid email or password',
      }),
      { status: 400 }
    )

    // When
    const promise = client.loginWithPassword({
      email: 'john.doe@example.com',
      password: 'majefize',
    })

    // Then
    await expect(promise).rejects.toEqual(expectedError)
    expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
  })
})
