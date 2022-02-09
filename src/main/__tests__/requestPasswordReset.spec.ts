import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { headersTest } from './helpers/identityHelpers'
import { defineWindowProperty } from './helpers/windowHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('simple', async () => {
  const { client, clientId, domain } = createDefaultTestClient()

  const passwordResetCall = fetchMock.mockResponseOnce('', {
    status: 204,
  })

  const email = 'john.doe@example.com'

  await client.requestPasswordReset({ email })

  expect(passwordResetCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/forgot-password`, {
    method: 'POST',
    headers: headersTest.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      email,
    }),
  })
})
