import fetchMock from 'jest-fetch-mock'

import { headers } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'

beforeAll(() => {
  fetchMock.enableMocks()
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('simple', async () => {
  // Given
  const { client, clientId, domain } = createDefaultTestClient()

  const accessToken = '1234556789'

  const idToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
  const newAccessToken = 'kjbsdfljndvlksndfv'
  const expiresIn = 1800
  const tokenType = 'Bearer'

  const authenticatedHandler = jest.fn()
  client.on('authenticated', authenticatedHandler)

  const refreshCall = fetchMock.mockResponseOnce(
    JSON.stringify({
      id_token: idToken,
      access_token: newAccessToken,
      expires_in: expiresIn,
      token_type: tokenType
    })
  )

  // When
  const authResult = await client.refreshTokens({ accessToken })

  // Then
  expect(authResult).toEqual({
    idToken,
    idTokenPayload: {
      name: 'John Doe',
      sub: '1234567890'
    },
    accessToken: newAccessToken,
    expiresIn,
    tokenType
  })

  expect(refreshCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/token/access-token`, {
    method: 'POST',
    headers: headers.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      access_token: accessToken
    })
  })

  expect(authenticatedHandler).not.toHaveBeenCalled()
})
