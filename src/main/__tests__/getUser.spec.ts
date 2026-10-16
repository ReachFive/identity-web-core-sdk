import fetchMock from 'jest-fetch-mock'

import type { ProviderMetadata } from '../../api/models'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

const accessToken = 'W8ub2c0Lm1lIiwic3ViIjoiQVdYMmdFeWswOTB'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('crypto', mockWindowCrypto)
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

test('provider metadata is an object keyed by provider, with its fields camel-cased', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(
    JSON.stringify({
      provider_metadata: {
        kakaotalk: { ci: 'ci123', ci_authenticated_at: '2049-01-01T12:00:00Z', kakaotalk_age_range: '20~29' }
      }
    })
  )

  const { providerMetadata } = await client.getUser({ accessToken, fields: 'provider_metadata' })

  const expected: ProviderMetadata = {
    kakaotalk: { ci: 'ci123', ciAuthenticatedAt: '2049-01-01T12:00:00Z', kakaotalkAgeRange: '20~29' }
  }
  expect(providerMetadata).toEqual(expected)
})
