import { computeAuthOptions } from '../authOptions'
import { defaultScope } from './helpers/oauthHelpers'

describe('computeAuthOptions', () => {
  test('responseType defaults', () => {
    expect(computeAuthOptions()).toEqual({
      display: 'page',
      responseType: 'token',
      scope: defaultScope,
    })
    expect(computeAuthOptions({})).toEqual({
      display: 'page',
      responseType: 'token',
      scope: defaultScope,
    })
  })

  test('with redirect uri', () => {
    expect(
      computeAuthOptions({
        redirectUri: 'https://localhost/login.callback',
      })
    ).toEqual({
      display: 'page',
      responseType: 'code',
      scope: defaultScope,
      redirectUri: 'https://localhost/login.callback',
    })
  })

  test('with extended scope', () => {
    const result = {
      display: 'page',
      responseType: 'token',
      scope: `${defaultScope} address`,
    }
    expect(
      computeAuthOptions({
        scope: ['address'],
      })
    ).toEqual(result)
    expect(
      computeAuthOptions({
        scope: 'address',
      })
    ).toEqual(result)
  })

  test('with specific scope', () => {
    const result = {
      display: 'page',
      responseType: 'token',
      scope: 'openid profile',
    }
    expect(
      computeAuthOptions({
        fetchBasicProfile: false,
        scope: ['openid', 'profile'],
      })
    ).toEqual(result)
    expect(
      computeAuthOptions({
        fetchBasicProfile: false,
        scope: 'openid profile',
      })
    ).toEqual(result)
  })

  // popup mode is only allowed in social login
  test('popup mode when accepted', () => {
    expect(computeAuthOptions({ popupMode: true }, { acceptPopupMode: true })).toEqual({
      display: 'popup',
      responseType: 'token',
      scope: defaultScope,
    })
  })

  test('popup mode when refused', () => {
    expect(computeAuthOptions({ popupMode: true })).toEqual({
      display: 'page',
      responseType: 'token',
      scope: defaultScope,
    })
  })

  test('with refresh token required', () => {
    expect(
      computeAuthOptions({
        requireRefreshToken: true,
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: `${defaultScope} offline_access`,
    })
  })

  test('origin', () => {
    expect(
      computeAuthOptions({
        origin: 'single',
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: defaultScope,
      origin: 'single',
    })
  })

  test('accessToken', () => {
    expect(
      computeAuthOptions({
        accessToken: 'abc.123.def',
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: defaultScope,
      accessToken: 'abc.123.def',
    })
  })
})
