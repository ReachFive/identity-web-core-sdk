import fetchMock from 'jest-fetch-mock'
import type { AuthOptions } from '../authOptions'
import type { PasswordlessParams } from '../oAuthClient'
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

describe('with data', () => {
  const sentBody = () => JSON.parse(fetchMock.mock.calls[1][1]?.body as string)

  test('forwards data in snake case', async () => {
    const { client } = createDefaultTestClient(pblic)
    fetchMock.mockResponseOnce(JSON.stringify(''))

    await client.startPasswordless(
      {
        ...authParams,
        data: {
          givenName: 'John',
          familyName: 'Doe',
          consents: { newsletter: { granted: true, consentType: 'opt-in' } }
        }
      },
      authOptions
    )

    expect(sentBody()).toMatchObject({
      auth_type: 'magic_link',
      email: authParams.email,
      data: {
        given_name: 'John',
        family_name: 'Doe',
        consents: { newsletter: { granted: true, consent_type: 'opt-in' } }
      }
    })
  })

  test('forwards data for sms', async () => {
    const { client } = createDefaultTestClient(pblic)
    fetchMock.mockResponseOnce(JSON.stringify(''))

    await client.startPasswordless(
      { authType: 'sms', phoneNumber: '+33612345678', data: { givenName: 'John' } },
      authOptions
    )

    expect(sentBody()).toMatchObject({
      auth_type: 'sms',
      phone_number: '+33612345678',
      data: { given_name: 'John' }
    })
  })

  test('forwards data when flow is orchestrated', async () => {
    defineWindowProperty('location', { search: 'r5_request_token=orchestratedtoken' })
    const { client } = createDefaultTestClient(pblic)
    fetchMock.mockResponseOnce(JSON.stringify(''))

    await client.startPasswordless({ ...authParams, data: { givenName: 'John' } }, authOptions)

    expect(sentBody()).toMatchObject({
      r5_request_token: 'orchestratedtoken',
      email: authParams.email,
      data: { given_name: 'John' }
    })
    defineWindowProperty('location')
  })

  test('drops identifiers passed inside data', async () => {
    const { client } = createDefaultTestClient(pblic)
    fetchMock.mockResponseOnce(JSON.stringify(''))
    const data = { givenName: 'John', email: 'other@example.com', phoneNumber: '+33600000000' }

    await client.startPasswordless({ ...authParams, data }, authOptions)

    expect(sentBody().email).toEqual(authParams.email)
    expect(sentBody().data).toEqual({ given_name: 'John' })
  })

  test('omits data when not provided', async () => {
    const { client } = createDefaultTestClient(pblic)
    fetchMock.mockResponseOnce(JSON.stringify(''))

    await client.startPasswordless(authParams, authOptions)

    expect(sentBody()).not.toHaveProperty('data')
  })
})
