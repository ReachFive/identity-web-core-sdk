import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('simple', async () => {
  const { client, clientId, domain } = createDefaultTestClient()

  const passwordResetCall = fetchMock.mockResponseOnce('', {
    status: 204
  })

  const email = 'john.doe@example.com'

  client.requestPasswordReset({ email }).then(() => {
    expect(passwordResetCall).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/forgot-password`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining(headers.jsonAndDefaultLang),
        body: JSON.stringify({
          client_id: clientId,
          email
        })
      })
    )
  })
})

test('with origin', async () => {
  const { client, clientId, domain } = createDefaultTestClient()

  const passwordResetCall = fetchMock.mockResponseOnce('', {
    status: 204
  })

  const email = 'john.doe@example.com'
  const origin = 'sdk-core'

  client.requestPasswordReset({ email, origin }).then(() => {
    expect(passwordResetCall).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/forgot-password`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining(headers.jsonAndDefaultLang),
        body: JSON.stringify({
          client_id: clientId,
          email,
          origin
        })
      })
    )
  })
})
