import fetchMock from 'jest-fetch-mock'
import type { AuthOptions } from '../authOptions'
import type { PasswordlessParams } from '../oAuthClient'
import { createDefaultTestClient } from './helpers/clientFactory'
import { confidential, mockPkceValues, pageDisplay, pblic, scope } from './helpers/oauthHelpers'
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

const authParams: PasswordlessParams = { authType: 'magic_link', email: 'john.doe@example.com' }
const authOptions: AuthOptions = { responseType: 'code', redirectUri: 'http://toto.com' }

describe('with default client', () => {
  test('pkce generated', async () => {
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

  test('with PKCE provided', async () => {
    const { domain, clientId, client } = createDefaultTestClient(pblic)

    const { code_challenge, code_challenge_method } = mockPkceValues

    // Given
    const startPasswordlessCall = fetchMock.mockResponseOnce(JSON.stringify(''))

    // When
    await client.startPasswordless(authParams, {
      ...authOptions,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method
    })

    // Then
    expect(startPasswordlessCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/passwordless/start`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({
        client_id: clientId,
        response_type: authOptions.responseType,
        redirect_uri: authOptions.redirectUri,
        code_challenge,
        code_challenge_method,
        ...scope,
        ...pageDisplay,
        auth_type: authParams.authType,
        email: authParams.email
      })
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

test('can send the profile data used to sign up a new user', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.startPasswordless({
    authType: 'magic_link',
    email: 'john@example.com',
    data: {
      givenName: 'John',
      customFields: { my_obj: { someKey: 1 } },
      addresses: [{ streetAddress: '1 rue X', default: true }]
    }
  })

  expect(lastFetchCall().body.data).toEqual({
    given_name: 'John',
    custom_fields: { my_obj: { someKey: 1 } },
    addresses: [{ street_address: '1 rue X', default: true }]
  })
})

test('resolves with nothing for a single-factor passwordless start', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await expect(client.startPasswordless({ authType: 'magic_link', email: 'john@example.com' })).resolves.toBeUndefined()
})
