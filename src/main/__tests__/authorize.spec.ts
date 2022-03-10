import fetchMock from 'jest-fetch-mock'

import { LoginWithPasswordParams } from '../apiClient'
import { createDefaultTestClient } from './helpers/clientFactory'
import { loginWithPasswordTest, signupTest } from './helpers/identityHelpers'
import {
  _public,
  code,
  confidential,
  email,
  getExpectedQueryString,
  pageDisplay,
  phone,
  tkn,
  token,
} from './helpers/oauthHelpers'
import { popNextRandomString } from './helpers/randomStringMock'
import { defineWindowProperty, mockWindowCrypto } from './helpers/windowHelpers'

beforeAll(() => {
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  document.body.innerHTML = ''
  jest.resetAllMocks()
  fetchMock.resetMocks()
  popNextRandomString()
})

describe('with redirection', () => {
  describe.each`
    clientType      | responseType
    ${_public}      | ${token}
    ${_public}      | ${code}
    ${confidential} | ${token}
    ${confidential} | ${code}
  `('$clientType | $responseType', ({ clientType, responseType }) => {
    test.each([email, phone])('loginWithPassword: %j', async credentials => {
      const testKit = createDefaultTestClient({ ...clientType })
      const { domain } = testKit

      const authParams = {
        ...credentials,
        auth: responseType,
      } as LoginWithPasswordParams

      await loginWithPasswordTest(testKit, authParams, credentials)

      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            ...responseType,
            ...pageDisplay,
            ...tkn,
          })
      )
    })

    test('signup', async () => {
      const testKit = createDefaultTestClient({ ...clientType })
      const { domain } = testKit

      const params = {
        data: {
          givenName: 'John',
          familyName: 'Doe',
          email: 'john.doe@example.com',
          password: 'P@ssw0rd',
        },
        auth: {
          ...responseType,
        },
      }

      await signupTest(testKit, params)

      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            ...responseType,
            ...pageDisplay,
            ...tkn,
          })
      )
    })

    test('loginFromSession', async () => {
      // Given
      const { client, domain } = createDefaultTestClient({
        sso: true,
        ...clientType,
      })

      // When
      await client.loginFromSession({
        ...responseType,
      })

      // Then
      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            ...responseType,
            ...pageDisplay,
            prompt: 'none',
          })
      )
    })
  })
})
