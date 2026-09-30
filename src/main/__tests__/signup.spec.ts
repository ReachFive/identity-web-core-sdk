import fetchMock from 'jest-fetch-mock'

import { snakeCaseProperties } from '../../utils/transformObjectProperties'
import type { SignupParams } from '../oAuthClient'
import type { TestKit } from './helpers/clientFactory'
import { createDefaultTestClient } from './helpers/clientFactory'
import { scope, tkn } from './helpers/oauthHelpers'
import { defineWindowProperty, headers, lastFetchCall, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

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
      ...tkn
    })
  )

  // When
  await client.signup(params)

  await expect(signupCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/signup`, {
    method: 'POST',
    headers: expect.objectContaining(headers.jsonAndDefaultLang),
    body: JSON.stringify({
      client_id: clientId,
      ...scope,
      data: snakeCaseProperties(params.data)
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
  const promise = client.signup({
    data: {
      email: 'john.doe@example.com',
      password: 'majefize'
    }
  })

  await expect(promise).rejects.toEqual(expectedError)
  await expect(signupFailedHandler).toHaveBeenCalledWith(expectedError)
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
      password: 'majefize'
    }
  })

  await expect(promise).rejects.toThrow(expectedError)
  await expect(signupFailedHandler).not.toHaveBeenCalled()
})

test("sends an address's default flag under the name the API reads, `default`", async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ id: '1234' }))

  // With a single address, the API makes it the default whatever the flag: two are needed for the flag to matter.
  await client.signup({
    data: {
      email: 'john@example.com',
      password: 'p',
      addresses: [
        { streetAddress: '1 rue X', isDefault: false },
        { streetAddress: '2 rue Y', isDefault: true }
      ]
    }
  })

  expect(lastFetchCall().body.data.addresses).toEqual([
    { street_address: '1 rue X', default: false },
    { street_address: '2 rue Y', default: true }
  ])
})
