import fetchMock from 'jest-fetch-mock'

import {
  defineWindowProperty,
  expectIframeWithParamss,
  mockWindowCrypto
} from './helpers/testHelpers'
import { mockNextRandom, popNextRandomString } from './helpers/randomStringMock'
import { randomBase64String } from '../../utils/random'
import {
  code,
  confidential,
  email,
  getExpectedQueryString,
  pageDisplay,
  pblic,
  phone,
  tkn,
  token, webMessage
} from './helpers/oauthHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'
import { LoginWithPasswordParams } from '../apiClient'
import { loginWithPasswordTest } from './loginWithPassword.spec'
import { signupTest } from './signup.spec'

fetchMock.enableMocks()
defineWindowProperty('crypto', mockWindowCrypto)
defineWindowProperty('location')

beforeEach(() => {
  document.body.innerHTML = ''
  jest.resetAllMocks()
  fetchMock.resetMocks()
  popNextRandomString()
})

describe('with redirection', () => {

  describe.each`
  clientType            | responseType
  ${pblic}          | ${token}
  ${pblic}          | ${code}
  ${confidential}   | ${token}
  ${confidential}   | ${code}
  `('$clientType | $responseType', ({ clientType, responseType }) => {

    test.each([email, phone])('loginWithPassword: %j', async (credentials) => {
      const testkit = createDefaultTestClient({ ...clientType })
      const { domain } = testkit

      const authParams = {
        ...credentials,
        auth: {
          ...responseType
        }
      } as LoginWithPasswordParams
      await loginWithPasswordTest(testkit, authParams, credentials)

      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` + getExpectedQueryString({
          ...clientType,
          ...responseType,
          ...pageDisplay,
          ...tkn,
        })
      )
    })

    test('signup', async () => {
      const testkit = createDefaultTestClient({ ...clientType })
      const { domain } = testkit

      const params = {
        data: {
          givenName: 'John',
          familyName: 'Doe',
          email: 'john.doe@example.com',
          password: 'P@ssw0rd'
        },
        auth: {
          ...responseType
        }
      }
      await signupTest(testkit, params)

      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` + getExpectedQueryString({
          ...clientType,
          ...responseType,
          ...pageDisplay,
          ...tkn,
        })
      )
    })

    test('loginFromSession', async () => {
      // Given
      const { client, domain } = createDefaultTestClient({ sso: true, ...clientType })

      // When
      await client.loginFromSession({
        ...responseType
      })

      // Then
      expect(window.location.assign).toHaveBeenCalledWith(
        `https://${domain}/oauth/authorize?` + getExpectedQueryString({
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
  clientType            | responseType
  ${pblic}          | ${token}
  ${pblic}          | ${code}
  ${confidential}   | ${token}
  `('$clientType | $responseType', ({ clientType, responseType }) => {

    test.each([email, phone])('loginWithPassword: %j', async (credentials) => {
      const testkit = createDefaultTestClient({ ...clientType })
      const { domain } = testkit
      const iframeId = randomBase64String()

      // Given
      const authParams = {
        ...credentials,
        auth: {
          ...responseType,
          useWebMessage: true
        }
      } as LoginWithPasswordParams

      // When
      loginWithPasswordTest(testkit, authParams, credentials)

      // Then
      const expectedSrc = `https://${domain}/oauth/authorize?` + getExpectedQueryString({
        ...clientType,
        ...responseType,
        ...webMessage,
        ...tkn,
      })
      await expectIframeWithParamss(iframeId, expectedSrc)
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
          password: 'P@ssw0rd'
        },
        auth: {
          ...responseType,
          useWebMessage: true
        }
      }
      signupTest(testkit, params)

      const expectedSrc = `https://${domain}/oauth/authorize?` + getExpectedQueryString({
        ...clientType,
        ...responseType,
        ...webMessage,
        ...tkn,
      })
      await expectIframeWithParamss(iframeId, expectedSrc)
    })

    test('checkSession', async () => {
      const { client, domain } = createDefaultTestClient({ sso: true, ...clientType })
      const nonce = 'abc123def'
      mockNextRandom(nonce)

      client.checkSession({
        nonce,
        ...responseType
      })

      /*
      Public clients will force to response_type=code.
      If a redirectUri is provided use it, otherwise omit it as the backend will check using the origin
       */
      const expectedSrc = `https://${domain}/oauth/authorize?` + getExpectedQueryString({
        ...clientType,
        ...responseType,
        responseType: (clientType.isPublic) ? 'code' : 'token',
        ...webMessage,
        nonce,
      })
      await expectIframeWithParamss(nonce, expectedSrc)
    })
  })

  describe('special: code flows auto-converted to implicit for confidential clients', () => {
    describe.each`
    clientType            | responseType
    ${confidential}       | ${code}
    `('$clientType | $responseType', ({clientType, responseType}) => {

      test.each([email, phone])('loginWithPassword: %j', async (credentials) => {
        const testkit = createDefaultTestClient({ ...clientType })
        const { domain } = testkit
        const iframeId = randomBase64String()

        // When
        const authParams = {
          ...credentials,
          auth: {
            ...responseType,
            useWebMessage: true
          }
        } as LoginWithPasswordParams

        loginWithPasswordTest(testkit, authParams, credentials)

        const expectedSrc = `https://${domain}/oauth/authorize?` + getExpectedQueryString({
          ...clientType,
          responseType: 'token',
          ...credentials,
          ...webMessage,
          ...tkn,
        })
        await expectIframeWithParamss(iframeId, expectedSrc)
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
            password: 'P@ssw0rd'
          },
          auth: {
            ...responseType,
            useWebMessage: true
          }
        }
        signupTest(testkit, params)

        const expectedSrc = `https://${domain}/oauth/authorize?` + getExpectedQueryString({
          ...clientType,
          responseType: 'token',
          ...webMessage,
          ...tkn,
        })
        await expectIframeWithParamss(iframeId, expectedSrc)
      })

      test('checkSession', async () => {
        const { client, domain } = createDefaultTestClient({ sso: true, ...clientType })
        const nonce = 'abc123def'
        mockNextRandom(nonce)

        client.checkSession({
          nonce,
          ...responseType
        })

        /*
        Confidential clients cannot complete a code flow in web messages.
        In those cases, force response_type=token.
         */
        const expectedSrc = `https://${domain}/oauth/authorize?` + getExpectedQueryString({
          ...clientType,
          responseType: 'token',
          ...webMessage,
          nonce,
        })
        await expectIframeWithParamss(nonce, expectedSrc)
      })
    })
  })
})
