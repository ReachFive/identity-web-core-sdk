import fetchMock from 'jest-fetch-mock'

import { defineWindowProperty, headers } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'

fetchMock.enableMocks()
defineWindowProperty('location')

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
    expect(passwordResetCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/forgot-password`, {
      method: 'POST',
      headers: headers.jsonAndDefaultLang,
      body: JSON.stringify({
        client_id: clientId,
        email
      })
    })
  })
})
