import fetchMock from 'jest-fetch-mock'
import { delay } from 'lodash'

import { randomBase64String } from '../../utils/random'
import { LoginWithPasswordParams } from '../apiClient'
import { createDefaultTestClient } from './helpers/clientFactory'
import { loginWithPasswordTest, signupTest } from './helpers/identityHelpers'
import { expectIframeWithParams } from './helpers/iframeHelpers'
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
  webMessage,
} from './helpers/oauthHelpers'
import { mockNextRandom, popNextRandomString } from './helpers/randomStringMock'
import { defineWindowProperty, mockWindowCrypto } from './helpers/windowHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
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

describe('with web message', () => {
  // confidential + code omitted, see special case
  describe.each`
    clientType      | responseType
    ${_public}      | ${token}
    ${_public}      | ${code}
    ${confidential} | ${token}
  `('$clientType | $responseType', ({ clientType, responseType }) => {
    test.each([email, phone])('loginWithPassword: %j', credentials => {
      const testKit = createDefaultTestClient({ ...clientType })
      const { domain } = testKit
      const iframeId = randomBase64String()

      // Given
      const authParams = {
        ...credentials,
        auth: {
          ...responseType,
          useWebMessage: true,
        },
      } as LoginWithPasswordParams

      // When
      loginWithPasswordTest(testKit, authParams, credentials)

      // Then
      const expectedSrc =
        `https://${domain}/oauth/authorize?` +
        getExpectedQueryString({
          ...clientType,
          ...responseType,
          ...webMessage,
          ...tkn,
        })
      delay(expectIframeWithParams, 5000, iframeId, expectedSrc)
    })

    test('signup', () => {
      const testKit = createDefaultTestClient({ ...clientType })
      const { domain } = testKit
      const iframeId = randomBase64String()

      const params = {
        data: {
          givenName: 'John',
          familyName: 'Doe',
          email: 'john.doe@example.com',
          password: 'P@ssw0rd',
        },
        auth: {
          ...responseType,
          useWebMessage: true,
        },
      }

      signupTest(testKit, params)

      const expectedSrc =
        `https://${domain}/oauth/authorize?` +
        getExpectedQueryString({
          ...clientType,
          ...responseType,
          ...webMessage,
          ...tkn,
        })
      delay(expectIframeWithParams, 5000, iframeId, expectedSrc)
    })

    test('checkSession', () => {
      const { client, domain } = createDefaultTestClient({
        sso: true,
        ...clientType,
      })
      const nonce = 'abc123def'
      mockNextRandom(nonce)

      client.checkSession({
        nonce,
        ...responseType,
      })

      /*
      Public clients will force to response_type=code.
      If a redirectUri is provided use it, otherwise omit it as the backend will check using the origin
       */
      const expectedSrc =
        `https://${domain}/oauth/authorize?` +
        getExpectedQueryString({
          ...clientType,
          ...responseType,
          responseType: clientType.isPublic ? 'code' : 'token',
          ...webMessage,
          nonce,
        })
      delay(expectIframeWithParams, 5000, nonce, expectedSrc)
    })
  })

  describe('special: code flows auto-converted to implicit for confidential clients', () => {
    describe.each`
      clientType      | responseType
      ${confidential} | ${code}
    `('$clientType | $responseType', ({ clientType, responseType }) => {
      test.each([email, phone])('loginWithPassword: %j', credentials => {
        const testKit = createDefaultTestClient({ ...clientType })
        const { domain } = testKit
        const iframeId = randomBase64String()

        // When
        const authParams = {
          ...credentials,
          auth: {
            ...responseType,
            useWebMessage: true,
          },
        } as LoginWithPasswordParams

        loginWithPasswordTest(testKit, authParams, credentials)

        const expectedSrc =
          `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            responseType: 'token',
            ...credentials,
            ...webMessage,
            ...tkn,
          })
        delay(expectIframeWithParams, 5000, iframeId, expectedSrc)
      })

      test('signup', () => {
        const testKit = createDefaultTestClient({ ...clientType })
        const { domain } = testKit
        const iframeId = randomBase64String()

        const params = {
          data: {
            givenName: 'John',
            familyName: 'Doe',
            email: 'john.doe@example.com',
            password: 'P@ssw0rd',
          },
          auth: {
            ...responseType,
            useWebMessage: true,
          },
        }

        signupTest(testKit, params)

        const expectedSrc =
          `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            responseType: 'token',
            ...webMessage,
            ...tkn,
          })

        delay(expectIframeWithParams, 5000, iframeId, expectedSrc)
      })

      test('checkSession', () => {
        const { client, domain } = createDefaultTestClient({
          sso: true,
          ...clientType,
        })
        const nonce = 'abc123def'
        mockNextRandom(nonce)

        client.checkSession({
          nonce,
          ...responseType,
        })

        /*
        Confidential clients cannot complete a code flow in web messages.
        In those cases, force response_type=token.
         */
        const expectedSrc =
          `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            responseType: 'token',
            ...webMessage,
            nonce,
          })
        delay(expectIframeWithParams, 5000, nonce, expectedSrc)
      })
    })
  })
})
