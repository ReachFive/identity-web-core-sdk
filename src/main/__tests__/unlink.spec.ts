import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, lastFetchCall, mockWindowCrypto } from './helpers/testHelpers'

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

test('sends the identity to unlink', async () => {
  const { client, domain } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.unlink({ accessToken, identityId: 'facebook:1' })

  expect(lastFetchCall()).toEqual({ url: `https://${domain}/identity/v1/unlink`, body: { identity_id: 'facebook:1' } })
})

test('can keep the identity in a lite profile', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await client.unlink({ accessToken, identityId: 'facebook:1', keepInLiteProfile: true })

  // The API reads this one from the query string, under this exact camelCase name.
  expect(new URL(lastFetchCall().url).searchParams.get('keepInLiteProfile')).toBe('true')
  expect(lastFetchCall().body).toEqual({ identity_id: 'facebook:1' })
})

test('resolves with the profile', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce(JSON.stringify({ id: 'AVPw', given_name: 'John' }))

  await expect(client.unlink({ accessToken, identityId: 'facebook:1' })).resolves.toEqual({
    id: 'AVPw',
    givenName: 'John'
  })
})

test('resolves with nothing when no profile is left', async () => {
  const { client } = createDefaultTestClient()
  fetchMock.mockResponseOnce('', { status: 204 })

  await expect(client.unlink({ accessToken, identityId: 'facebook:1' })).resolves.toBeUndefined()
})
