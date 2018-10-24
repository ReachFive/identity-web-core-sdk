import 'core-js/shim'
import 'regenerator-runtime/runtime'
import fetchMock from 'jest-fetch-mock'
import { createClient } from '../main'
import { toQueryString } from '../../lib/queryString'

const clientId = 'ijzdfpidjf'

type AdditionalConfig = {
  sso?: boolean
}

function coreApi(config: AdditionalConfig) {
  const conf = {
    clientId: clientId,
    domain: 'local.reach5.net',
    ...config
  }

  // Mocks the initial config fetching
  fetchMock.mockResponseOnce(JSON.stringify(conf), { status: 200 })

  return createClient(conf)
}

beforeEach(() => {
  window.fetch = fetchMock
  window.location.assign = jest.fn()
})

test('loginFromSession', async () => {

  const api = coreApi({ sso: true });

  const redirectUri = 'https://mysite.com/login/callback'

  await api.loginFromSession({ redirectUri })

  expect(window.location.assign).toHaveBeenCalledWith(
    'https://local.reach5.net/oauth/authorize?' + toQueryString({
      'client_id': clientId,
      'response_type': 'code',
      'scope': 'openid profile email phone',
      'display': 'page',
      'redirect_uri': redirectUri,
      'prompt': 'none',
    })
  );
});