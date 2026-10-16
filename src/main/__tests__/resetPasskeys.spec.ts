import fetchMock from 'jest-fetch-mock'

import { createTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

const clientId = 'ijzdfpidjf'
const bytes = new Uint8Array([1, 2, 3]).buffer
const credential = {
  type: 'public-key',
  id: 'cred',
  rawId: bytes,
  response: { clientDataJSON: bytes, attestationObject: bytes, getTransports: () => [] }
}

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
  defineWindowProperty('location')
  defineWindowProperty('PublicKeyCredential', {})
  Object.defineProperty(navigator, 'credentials', {
    configurable: true,
    value: { create: jest.fn() }
  })
})

afterAll(() => {
  delete (window as { PublicKeyCredential?: unknown }).PublicKeyCredential
  delete (navigator as { credentials?: unknown }).credentials
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('sends the origin and the device name with the options request, and only there', async () => {
  const client = createTestClient({ clientId, domain: 'local.reach5.net', webAuthnOrigin: 'https://app.example.com' })
  ;(navigator.credentials.create as jest.Mock).mockResolvedValue(credential)
  fetchMock.mockResponseOnce(
    JSON.stringify({
      options: { public_key: { challenge: 'AQID', user: { id: 'AQID', name: 'j', display_name: 'j' } } }
    })
  )
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.resetPasskeys({ email: 'john@example.com', verificationCode: '1234', clientId, friendlyName: 'Phone' })

  const [options, reset] = fetchMock.mock.calls.slice(1).map(([, init]) => JSON.parse(init!.body as string))
  expect(options).toEqual({
    email: 'john@example.com',
    verification_code: '1234',
    client_id: clientId,
    origin: 'https://app.example.com',
    friendly_name: 'Phone'
  })
  expect(reset).toEqual({
    email: 'john@example.com',
    verification_code: '1234',
    client_id: clientId,
    public_key_credential: expect.objectContaining({ id: 'cred' })
  })
})
