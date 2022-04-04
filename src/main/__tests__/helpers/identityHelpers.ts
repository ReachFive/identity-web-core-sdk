import fetchMock from 'jest-fetch-mock'

import { snakeCaseProperties } from '../../../utils/transformObjectProperties'
import { LoginWithPasswordParams, SignupParams } from '../../apiClient'
import { TestKit } from './clientFactory'
import { scope, tkn } from './oauthHelpers'

// HTTP Headers helpers
// --------------------
const jsonHeader = { 'Content-Type': 'application/json;charset=UTF-8' }
const langHeader = (lang: string) => ({ 'Accept-Language': lang })
const defaultLangHeader = langHeader('en')
const accessTokenHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
})

export const headersTest = {
  json: jsonHeader,
  defaultLang: defaultLangHeader,
  lang: langHeader,
  accessToken: accessTokenHeader,
  jsonAndDefaultLang: {
    ...jsonHeader,
    ...defaultLangHeader,
  },
}

export async function signupTest(testKit: TestKit, params: SignupParams) {
  const { client, clientId, domain } = testKit

  // Given
  const signupCall = fetchMock.mockResponseOnce(
    JSON.stringify({
      id: '1234',
      ...tkn,
    })
  )

  // When
  await client.signup(params)

  // Then
  expect(signupCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/signup`, {
    method: 'POST',
    headers: headersTest.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      ...scope,
      data: snakeCaseProperties(params.data),
    }),
  })
}

export async function loginWithPasswordTest(testKit: TestKit, params: LoginWithPasswordParams, credentials: {}) {
  const { client, clientId, domain } = testKit

  // Given
  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify(tkn))

  // When
  await client.loginWithPassword(params)

  // Then
  expect(passwordLoginCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/password/login`, {
    method: 'POST',
    headers: headersTest.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      ...scope,
      ...credentials,
    }),
  })
}
