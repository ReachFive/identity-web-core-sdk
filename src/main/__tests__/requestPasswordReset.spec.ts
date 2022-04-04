import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { headersTest } from './helpers/identityHelpers'

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('simple', async () => {
  const { client, clientId, domain } = createDefaultTestClient()

  // Given
  const passwordResetCall = fetchMock.mockResponseOnce('', {
    status: 204,
  })

  const email = 'john.doe@example.com'

  // When
  await client.requestPasswordReset({ email })

  // Then
  expect(passwordResetCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/forgot-password`, {
    method: 'POST',
    headers: headersTest.jsonAndDefaultLang,
    body: JSON.stringify({
      client_id: clientId,
      email,
    }),
  })
})
