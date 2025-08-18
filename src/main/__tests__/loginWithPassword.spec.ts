import fetchMock from 'jest-fetch-mock'
import { LoginWithPasswordParams } from '../oAuthClient'
import { TestKit, createDefaultTestClient } from './helpers/clientFactory'
import { scope, tkn } from './helpers/oauthHelpers'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

export async function loginWithPasswordTest(testkit: TestKit, params: LoginWithPasswordParams, credentials: object) {
  const { domain, clientId, client } = testkit

  // Given
  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify(tkn))

  // When
  await client.loginWithPassword(params)

  // Then
  expect(passwordLoginCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/password/login`, {
    method: 'POST',
    headers: expect.objectContaining(headers.jsonAndDefaultLang),
    body: JSON.stringify({
      client_id: clientId,
      ...scope,
      ...credentials
    })
  })
}

describe('error cases', () => {
  test('[login_failed] invalid credentials', async () => {
    const { client } = createDefaultTestClient()

    // Given
    const loginFailedHandler = jest.fn()
    client.on('login_failed', loginFailedHandler)

    const expectedError = {
      error: 'invalid_grant',
      errorDescription: 'Invalid email or password',
      errorUsrMsg: 'Invalid email or password'
    }

    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid email or password',
        error_usr_msg: 'Invalid email or password'
      }),
      { status: 400 }
    )

    // When
    const promise = client.loginWithPassword({ email: 'john.doe@example.com', password: 'majefize' })

    // Then
    await expect(promise).rejects.toEqual(expectedError)
    await expect(loginFailedHandler).toHaveBeenCalledWith(expectedError)
  })
})
