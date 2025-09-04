import fetchMock from 'jest-fetch-mock'
import { AuthOptions } from '../authOptions'
import { PasswordlessParams } from '../oAuthClient'
import { createDefaultTestClient } from './helpers/clientFactory'
import { confidential, mockPkceValues, pageDisplay, pblic, scope } from './helpers/oauthHelpers'
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

const authParams: PasswordlessParams = { authType: 'magic_link', email: 'john.doe@example.com' }
const authOptions: AuthOptions = { responseType: 'code', redirectUri: 'http://toto.com' }

test('with default client', async () => {
  const { domain, clientId, client } = createDefaultTestClient(pblic)

  // Given
  const startPasswordlessCall = fetchMock.mockResponseOnce(JSON.stringify(''))

  // When
  await client.startPasswordless(authParams, authOptions)

  // Then
  expect(startPasswordlessCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/passwordless/start`, {
    method: 'POST',
    headers: expect.objectContaining(headers.jsonAndDefaultLang),
    body: JSON.stringify({
      client_id: clientId,
      response_type: authOptions.responseType,
      redirect_uri: authOptions.redirectUri,
      ...scope,
      ...pageDisplay,
      auth_type: authParams.authType,
      email: authParams.email,
      ...mockPkceValues
    })
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
    headers: expect.objectContaining(headers.jsonAndDefaultLang),
    body: JSON.stringify({
      client_id: clientId,
      response_type: authOptions.responseType,
      redirect_uri: authOptions.redirectUri,
      ...scope,
      ...pageDisplay,
      auth_type: authParams.authType,
      email: authParams.email
    })
  })
})
