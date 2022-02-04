import { createDefaultTestClient } from './helpers/clientFactory'

describe('SSO feature check', () => {
  const { client } = createDefaultTestClient({ sso: false })

  test('checkSession', async () => {
    await expect(client.checkSession()).rejects.toThrow(new Error(`Cannot call 'checkSession' if SSO is not enabled.`))
  })

  test('loginFromSession', async () => {
    await expect(client.loginFromSession()).rejects.toThrow(
      new Error(`Cannot call 'loginFromSession' if SSO is not enabled.`)
    )
  })
})
