import { createTestClient, headers } from './testHelpers'
import fetchMock from "jest-fetch-mock"

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('remote settings language has priority over transmitted language', async () => {
  // Given
  const clientId = 'Z1PCmtKZ4bFUjj1lOJeYkjR7SMqj8lf'
  const domain = 'local.reach5.net'
  const submittedLanguage = 'fr_FR'
  const actualLanguage = 'en'
  const accessToken = 'W8ub2c0Lm1lIiwic3ViIjoiQVdYMmdFeWswOTB'

  const api = createTestClient({
    clientId,
    domain,
    language: submittedLanguage
  }, {
    language: actualLanguage
  })

  const passwordLoginCall = fetchMock.mockResponseOnce(JSON.stringify({
    name: 'John Doe'
  }))

  // When
  await api.getUser({
    accessToken,
    fields: 'name'
  })

  // Then
  expect(passwordLoginCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/me?fields=name`, {
    method: 'GET',
    headers: {
      ...headers.lang(actualLanguage),
      ...headers.accessToken(accessToken)
    }
  })
})