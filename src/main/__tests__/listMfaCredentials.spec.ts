import fetchMock from 'jest-fetch-mock'
import { MFA } from '../../api/models'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

describe('list mfa credentials', () => {
  const accessToken = '456'

  test('returns passkey credentials alongside phone and email credentials', async () => {
    const { client, domain } = createDefaultTestClient()

    const phoneCredential: MFA.PhoneCredential = {
      type: 'sms',
      phoneNumber: '+33612345678',
      createdAt: '2026-01-01T00:00:00.000Z',
      friendlyName: 'My phone'
    }
    const emailCredential: MFA.EmailCredential = {
      type: 'email',
      email: 'user@reach5.co',
      createdAt: '2026-01-02T00:00:00.000Z',
      friendlyName: 'My email'
    }
    const passkeyCredential: MFA.PasskeyCredential = {
      type: 'passkey',
      id: 'credential-id',
      friendlyName: 'My passkey',
      createdAt: '2026-01-03T00:00:00.000Z',
      lastUsedAt: '2026-01-04T00:00:00.000Z'
    }

    // Given
    const listMfaCredentialsCall = fetchMock.mockResponseOnce(
      JSON.stringify({ credentials: [phoneCredential, emailCredential, passkeyCredential] })
    )

    // When
    const response = await client.listMfaCredentials(accessToken)

    // Then
    expect(listMfaCredentialsCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/mfa/credentials`, {
      method: 'GET',
      headers: expect.objectContaining({
        ...headers.accessToken(accessToken)
      })
    })
    expect(response.credentials).toEqual([phoneCredential, emailCredential, passkeyCredential])

    const passkey = response.credentials.find(MFA.isPasskeyCredential)
    expect(passkey).toEqual(passkeyCredential)
  })
})
