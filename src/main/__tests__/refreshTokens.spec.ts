import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { createClient } from '../main'


const clientId = 'zidhjfiusbdvzef'

function coreApi() {
  return createClient({
    clientId: clientId,
    domain: 'local.reach5.net'
  })
}

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('simple', async () => {

  // Given
  const api = coreApi()

  const accessToken = '1234556789'

  const idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
  const newAccessToken = 'kjbsdfljndvlksndfv'
  const expiresIn = 1800
  const tokenType = 'Bearer'

  const authenticatedHandler = jest.fn()
  api.on('authenticated', authenticatedHandler)

  const refreshCall = fetchMock.mockResponseOnce(JSON.stringify({
    'id_token': idToken,
    'access_token': newAccessToken,
    'expires_in': expiresIn,
    'token_type': tokenType
  }))

  // When
  const authResult = await api.refreshTokens({ accessToken })

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

  expect(refreshCall).toHaveBeenCalledWith('https://local.reach5.net/identity/v1/token/access-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      'client_id': clientId,
      'access_token': accessToken
    })
  })

  expect(authenticatedHandler).not.toHaveBeenCalled()
})