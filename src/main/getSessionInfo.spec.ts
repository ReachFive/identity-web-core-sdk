import fetchMock from "jest-fetch-mock"
import { toQueryString } from "../utils/queryString"
import { createDefaultTestClient } from "./__tests__/helpers/testHelpers"

describe('nominal', () => {
  test('with session cookie', async () => {
    const { api, domain, clientId } = createDefaultTestClient({ sso: true })

    const sessionInfoCall = fetchMock.mockResponseOnce(
      JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        last_login_type: 'password',
        is_authenticated: true,
        has_password: true,
        social_providers: []
      })
    )

    // When
    const result = await api.getSessionInfo()

    // Then
    expect(sessionInfoCall).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/sso/data?` +
      toQueryString({
        client_id: clientId
      }),
      {
        method: 'GET',
        headers: {},
        credentials: 'include'
      }
    )

    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastLoginType: 'password',
      isAuthenticated: true,
      hasPassword: true,
      socialProviders: []
    })
  })
})
