import fetchMock from 'jest-fetch-mock'

import { randomBase64String } from '../../utils/random'
import { LoginWithPasswordParams } from '../oAuthClient'
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
    ${_public}      | ${code}
    ${_public}      | ${token}
    ${confidential} | ${code}
    ${confidential} | ${token}
  `('$clientType | $responseType', ({ clientType, responseType }) => {
    test.each([email, phone])('loginWithPassword: %j', async credentials => {
      const testKit = createDefaultTestClient({ ...clientType })
      const { domain } = testKit

      // Given
      const authParams = {
        ...credentials,
        auth: responseType,
      } as LoginWithPasswordParams

      // When
      await loginWithPasswordTest(testKit, authParams, credentials)

      // Then
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

      // Given
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

      // When
      await signupTest(testKit, params)

      // Then
      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            ...tkn,
            ...responseType,
            ...pageDisplay,
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
          })
      )
    })
  })
})

describe('with web message', () => {
  // confidential + code omitted, see special case
  describe.each`
    clientType      | responseType
    ${_public}      | ${code}
    ${_public}      | ${token}
    ${confidential} | ${token}
  `('$clientType | $responseType', ({ clientType, responseType }) => {
    test.each([email, phone])('loginWithPassword: %j', async credentials => {
      const testkit = createDefaultTestClient({ ...clientType })
      const { domain } = testkit
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
      await loginWithPasswordTest(testkit, authParams, credentials)

      // Then
      const expectedSrc =
        `https://${domain}/oauth/authorize?` +
        getExpectedQueryString({
          ...clientType,
          ...responseType,
          ...webMessage,
          ...tkn,
        })
      await expectIframeWithParams(iframeId, expectedSrc)
    })

    test('signup', async () => {
      const testkit = createDefaultTestClient({ ...clientType })
      const { domain } = testkit
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
      await signupTest(testkit, params)

      const expectedSrc =
        `https://${domain}/oauth/authorize?` +
        getExpectedQueryString({
          ...clientType,
          ...responseType,
          ...webMessage,
          ...tkn,
        })
      await expectIframeWithParams(iframeId, expectedSrc)
    })

    test('checkSession', async () => {
      const { client, domain } = createDefaultTestClient({ sso: true, ...clientType })
      const nonce = 'abc123def'
      mockNextRandom(nonce)

      await client.checkSession({
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
      await expectIframeWithParams(nonce, expectedSrc)
    })
  })

  describe('special: code flows auto-converted to implicit for confidential clients', () => {
    describe.each`
      clientType      | responseType
      ${confidential} | ${code}
    `('$clientType | $responseType', ({ clientType, responseType }) => {
      test.each([email, phone])('loginWithPassword: %j', async credentials => {
        const testkit = createDefaultTestClient({ ...clientType })
        const { domain } = testkit
        const iframeId = randomBase64String()

        // When
        const authParams = {
          ...credentials,
          auth: {
            ...responseType,
            useWebMessage: true,
          },
        } as LoginWithPasswordParams

        await loginWithPasswordTest(testkit, authParams, credentials)

        const expectedSrc =
          `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            responseType: 'token',
            ...credentials,
            ...webMessage,
            ...tkn,
          })
        await expectIframeWithParams(iframeId, expectedSrc)
      })

      test('signup', async () => {
        const testkit = createDefaultTestClient({ ...clientType })
        const { domain } = testkit
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
        await signupTest(testkit, params)

        const expectedSrc =
          `https://${domain}/oauth/authorize?` +
          getExpectedQueryString({
            ...clientType,
            responseType: 'token',
            ...webMessage,
            ...tkn,
          })
        await expectIframeWithParams(iframeId, expectedSrc)
      })

      test('checkSession', async () => {
        const { client, domain } = createDefaultTestClient({ sso: true, ...clientType })
        const nonce = 'abc123def'
        mockNextRandom(nonce)

        await client.checkSession({
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
        await expectIframeWithParams(nonce, expectedSrc)
      })
    })
  })
})
