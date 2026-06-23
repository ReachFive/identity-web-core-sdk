import fetchMock from 'jest-fetch-mock'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'
import { toQueryString } from '../../utils/queryString'
import { defaultScope } from './helpers/oauthHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('with orchestrated flow', async () => {
  const { domain, client } = createDefaultTestClient()
  const mockWindowLocationAssignCall = fetchMock.mockResponse((_) => {
    return Promise.resolve('')
  })
  defineWindowProperty('location', {
    // set r5_request_token to switch in orchestrated flow
    search: 'r5_request_token=orchestratedtoken',
    assign: mockWindowLocationAssignCall
  })

  const verifyAuthCodeCall = fetchMock.mockResponse(JSON.stringify({}))

  await client.verifyPasswordless({
    authType: 'magic_link',
    verificationCode: 'my-code',
    email: 'email@test.fr'
  })

  expect(verifyAuthCodeCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/verify-auth-code`, {
    method: 'POST',
    headers: expect.objectContaining(headers.jsonAndDefaultLang),
    body: JSON.stringify({
      auth_type: 'magic_link',
      verification_code: 'my-code',
      email: 'email@test.fr'
    })
  })
  expect(mockWindowLocationAssignCall).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/passwordless/verify?${toQueryString({
      auth_type: 'magic_link',
      verification_code: 'my-code',
      email: 'email@test.fr'
      // AuthParameters are not forwarded in orchestrated flow
    })}`
  )
})

test('without orchestrated flow', async () => {
  const { domain, client, clientId } = createDefaultTestClient()
  const mockWindowLocationAssignCall = fetchMock.mockResponse((_) => {
    return Promise.resolve('')
  })
  defineWindowProperty('location', { assign: mockWindowLocationAssignCall })

  const verifyAuthCodeCall = fetchMock.mockResponse(JSON.stringify({}))

  await client.verifyPasswordless({
    authType: 'magic_link',
    verificationCode: 'my-code',
    email: 'email@test.fr'
  })

  expect(verifyAuthCodeCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/verify-auth-code`, {
    method: 'POST',
    headers: expect.objectContaining(headers.jsonAndDefaultLang),
    body: JSON.stringify({
      auth_type: 'magic_link',
      verification_code: 'my-code',
      email: 'email@test.fr'
    })
  })
  expect(mockWindowLocationAssignCall).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/passwordless/verify?${toQueryString({
      clientId,
      response_type: 'token',
      scope: defaultScope,
      display: 'page',
      auth_type: 'magic_link',
      verification_code: 'my-code',
      email: 'email@test.fr'
    })}`
  )
})
