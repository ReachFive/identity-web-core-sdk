import fetchMock from 'jest-fetch-mock'

import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, lastAssignedUrl } from './helpers/testHelpers'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

describe('logout', () => {
  test('forwards the state along the redirect url', async () => {
    const { client, domain } = createDefaultTestClient()

    await client.logout({ redirectTo: 'https://example.com/callback', state: 'L2ZyL3BhZ2U=' })

    expect(window.location.assign).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/logout?` + 'redirect_to=https%3A%2F%2Fexample.com%2Fcallback&state=L2ZyL3BhZ2U%3D'
    )
  })

  test('forwards the state without a redirect url', async () => {
    const { client, domain } = createDefaultTestClient()

    await client.logout({ state: 'abc' })

    expect(window.location.assign).toHaveBeenCalledWith(`https://${domain}/identity/v1/logout?state=abc`)
  })

  test('does not send a state when none is given', async () => {
    const { client, domain } = createDefaultTestClient()

    await client.logout({ redirectTo: 'https://example.com/callback' })

    expect(window.location.assign).toHaveBeenCalledWith(
      `https://${domain}/identity/v1/logout?redirect_to=https%3A%2F%2Fexample.com%2Fcallback`
    )
  })
})

test('does not send removeCredentials, which only means something to the SDK', async () => {
  const { client } = createDefaultTestClient()

  await client.logout({ redirectTo: 'https://example.com', removeCredentials: true })

  expect(lastAssignedUrl().searchParams.has('remove_credentials')).toBe(false)
  expect(lastAssignedUrl().searchParams.get('redirect_to')).toBe('https://example.com')
})
