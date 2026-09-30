import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, lastFetchCall, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('does not send persistent, which the token endpoint does not read', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'a', expires_in: 1, token_type: 'Bearer' }))

  await client.exchangeAuthorizationCodeWithPkce({ code: 'c', redirectUri: 'https://example.com', persistent: true })

  expect(lastFetchCall().body).toMatchObject({ grant_type: 'authorization_code', code: 'c' })
  expect(lastFetchCall().body).not.toHaveProperty('persistent')
})
