import fetchMock from 'jest-fetch-mock'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'
import { toQueryString } from '../../utils/queryString'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

describe('with orchestrated flow', () => {
  test('max trials not exceeded', async () => {
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

    await client.verifyMfaPasswordless({
      challengeId: 'challenge-id',
      verificationCode: 'my-code'
    })

    expect(verifyAuthCodeCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/verify-auth-code`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({
        challenge_id: 'challenge-id',
        verification_code: 'my-code'
      })
    })
    expect(mockWindowLocationAssignCall).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/passwordless/verify?${toQueryString({
        challenge_id: 'challenge-id',
        verification_code: 'my-code'
      })}`
    )
  })

  test('max trials exceeded', async () => {
    const { client } = createDefaultTestClient()

    defineWindowProperty('location', { search: 'r5_request_token=orchestratedtoken' })

    const expectedError = {
      error: 'invalid_grant',
      errorDescription: 'Invalid verification code',
      errorUsrMsg: 'Invalid verification code',
      errorMessageKey: 'error.invalidVerificationCode'
    }
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid verification code',
        error_usr_msg: 'Invalid verification code',
        error_message_key: 'error.invalidVerificationCode'
      }),
      { status: 401 }
    )
    const promise = client.verifyMfaPasswordless({
      challengeId: 'challenge-id',
      verificationCode: 'my-code'
    })

    await expect(promise).rejects.toEqual(expectedError)
  })
})

describe('not orchestrated flow', () => {
  test('success', async () => {

    const { domain, client } = createDefaultTestClient()
    defineWindowProperty('location', {})
    const verifyPasswordlessCall = fetchMock.mockResponse(
      JSON.stringify({
        code: 'my-code'
      })
    )

    await client.verifyMfaPasswordless({
      challengeId: 'challenge-id',
      verificationCode: 'my-code'
    })
    expect(verifyPasswordlessCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/passwordless/verify`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({
        challenge_id: 'challenge-id',
        verification_code: 'my-code'
      })
    })
  })

  test('failure', async () => {
    const { client } = createDefaultTestClient()

    const expectedError = {
      error: 'invalid_grant',
      errorDescription: 'Invalid verification code',
      errorUsrMsg: 'Invalid verification code',
      errorMessageKey: 'error.invalidVerificationCode'
    }

    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid verification code',
        error_usr_msg: 'Invalid verification code',
        error_message_key: 'error.invalidVerificationCode'
      }),
      { status: 401 }
    )

    const promise = client.verifyMfaPasswordless({
      challengeId: 'challenge-id',
      verificationCode: 'my-code'
    })

    await expect(promise).rejects.toEqual(expectedError)
  })
})
