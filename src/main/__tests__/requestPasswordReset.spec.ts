import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, headers, lastFetchCall, mockWindowCrypto } from './helpers/testHelpers'

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

test('accepts a custom identifier', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.requestPasswordReset({ customIdentifier: 'member-42' })

  expect(lastFetchCall().body).toMatchObject({ custom_identifier: 'member-42' })
})

test('accepts a state', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.requestPasswordReset({ email: 'john@example.com', state: 'xyz' })

  expect(lastFetchCall().body).toMatchObject({ state: 'xyz' })
})
