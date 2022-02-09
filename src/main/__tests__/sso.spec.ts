import { createDefaultTestClient } from './helpers/clientFactory'

describe('SSO feature check', () => {
  const { client } = createDefaultTestClient({ sso: false })

  test('checkSession', async () => {
    const promise = client.checkSession()
    await expect(promise).rejects.toThrow(new Error(`Cannot call 'checkSession' if SSO is not enabled.`))
  })

  test('loginFromSession', async () => {
    const promise = client.loginFromSession()
    await expect(promise).rejects.toThrow(new Error(`Cannot call 'loginFromSession' if SSO is not enabled.`))
  })
})
