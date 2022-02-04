import fetchMock from 'jest-fetch-mock'

import { PasswordlessParams } from '../apiClient'
import { AuthOptions } from '../authOptions'
import { createDefaultTestClient } from './helpers/clientFactory'
import { headersTest } from './helpers/identityHelpers'
import { _public, confidential, mockPkceValues, pageDisplay, scope } from './helpers/oauthHelpers'
import { defineWindowProperty, mockWindowCrypto } from './helpers/windowHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

const authParams: PasswordlessParams = {
  authType: 'magic_link',
  email: 'john.doe@example.com',
}
const authOptions: AuthOptions = {
  responseType: 'code',
  redirectUri: 'http://toto.com',
}

test('with default client', async () => {
  const { domain, clientId, client } = createDefaultTestClient(_public)

  // Given
  const startPasswordlessCall = fetchMock.mockResponseOnce(JSON.stringify(''))

  // When
  await client.startPasswordless(authParams, authOptions)

  // Then
  expect(startPasswordlessCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/passwordless/start`, {
    method: 'POST',
    headers: headersTest.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      response_type: authOptions.responseType,
      redirect_uri: authOptions.redirectUri,
      ...scope,
      ...pageDisplay,
      auth_type: authParams.authType,
      email: authParams.email,
      ...mockPkceValues,
    }),
  })
})

test('with confidential client', async () => {
  const { domain, clientId, client } = createDefaultTestClient(confidential)

  // Given
  const startPasswordlessCall = fetchMock.mockResponseOnce(JSON.stringify(''))

  // When
  await client.startPasswordless(authParams, authOptions)

  // Then
  expect(startPasswordlessCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/passwordless/start`, {
    method: 'POST',
    headers: headersTest.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      response_type: authOptions.responseType,
      redirect_uri: authOptions.redirectUri,
      ...scope,
      ...pageDisplay,
      auth_type: authParams.authType,
      email: authParams.email,
    }),
  })
})
