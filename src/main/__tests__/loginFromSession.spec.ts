import fetchMock from 'jest-fetch-mock'
import { toQueryString } from '../../utils/queryString'
import { createDefaultTestClient } from './testHelpers'

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('loginFromSession', async () => {
  const { api, clientId, domain } = createDefaultTestClient({ sso: true })

  const redirectUri = 'https://mysite.com/login/callback'

  await api.loginFromSession({ redirectUri })

  expect(window.location.assign).toHaveBeenCalledWith(
    `https://${domain}/oauth/authorize?` +
      toQueryString({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: 'openid profile email phone',
        display: 'page',
        prompt: 'none'
      })
  )
})
