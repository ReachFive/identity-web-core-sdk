import fetchMock from 'jest-fetch-mock'

import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'
import { createDefaultTestClient } from './helpers/clientFactory'
import { popNextRandomString } from './helpers/randomStringMock'
import { delay } from '../../utils/promise'

fetchMock.enableMocks()
defineWindowProperty('location')
defineWindowProperty('crypto', mockWindowCrypto)

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
  popNextRandomString()
})

describe.each([true, false])('SSO feature check: %p', (sso) => {
  const { client } = createDefaultTestClient({ sso })

  test('checkSession', async () => {
    let error = null
    client.checkSession().catch(e => error = e)
    await delay(5)

    if (sso) {
      expect(error).toBeNull()
    } else {
      expect(error).toEqual(
        new Error(`Cannot call 'checkSession' if SSO is not enabled.`)
      )
    }
  })

  test('loginFromSession', async () => {
    let error = null
    client.loginFromSession().catch(e => error = e)
    await delay(5)

    if (sso) {
      expect(error).toBeNull()
    } else {
      expect(error).toEqual(
        new Error(`Cannot call 'loginFromSession' if SSO is not enabled.`)
      )
    }
  })
})
