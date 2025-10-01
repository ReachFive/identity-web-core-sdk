import fetchMock from 'jest-fetch-mock'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'
import { pageDisplay, scope, tkn } from './helpers/oauthHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

describe('step up', () => {
  test('no pkce generated when flow is orchestrated', async () => {
    const { client, clientId, domain } = createDefaultTestClient({ pkceEnforced: true })
    fetchMock.resetMocks()
    defineWindowProperty('location', { search: 'r5_request_token=orchestratedtoken' })

    // Given
    const getMfaStepUpCall = fetchMock.mockResponseOnce(JSON.stringify({ amr: [], token: 'token' }))
    // When
    await client.getMfaStepUpToken({ ...tkn })
    // Then
    expect(getMfaStepUpCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/mfa/stepup`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({
        ...tkn,
        client_id: clientId,
        response_type: 'token',
        ...pageDisplay
      })
    })
  })
  test('pkce error when flow is not orchestrated, response_type is token and pkce is enforced', async () => {
    const { client } = createDefaultTestClient({ pkceEnforced: true })
    fetchMock.resetMocks()
    defineWindowProperty('location', { search: '' })

    // When
    await expect(client.getMfaStepUpToken({ ...tkn })).rejects.toEqual(
      new Error('Cannot use implicit flow when PKCE is enforced')
    )
  })

  test('pkce generated when flow is not orchestrated, a redirect uri is specified and pkce is enforced', async () => {
    const { client, clientId, domain } = createDefaultTestClient({ pkceEnforced: true })
    fetchMock.resetMocks()
    defineWindowProperty('location', { search: '' })

    // Given
    const getMfaStepUpCall = fetchMock.mockResponseOnce(JSON.stringify({ amr: [], token: 'token' }))
    // When
    await client.getMfaStepUpToken({ ...tkn, options: { redirectUri: 'http://mysite.com/login/callback'}})
    // Then
    expect(getMfaStepUpCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/mfa/stepup`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: 'http://mysite.com/login/callback',
        ...scope,
        ...pageDisplay,
        ...tkn,
      })
    })
  })
})
