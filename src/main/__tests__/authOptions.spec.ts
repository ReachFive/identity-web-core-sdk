import { computeAuthOptions } from '../authOptions'

describe('computeAuthOptions', () => {
  test('responseType defaults', () => {
    expect(computeAuthOptions()).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
    expect(computeAuthOptions({})).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
  })

  test('with redirect uri', () => {
    expect(
      computeAuthOptions({
        redirectUri: 'https://localhost/login.callback'
      })
    ).toEqual({
      display: 'page',
      responseType: 'code',
      scope: 'openid profile email phone',
      redirectUri: 'https://localhost/login.callback'
    })
  })

  test('with extended scope', () => {
    const result = {
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone address'
    }
    expect(
      computeAuthOptions({
        scope: ['address']
      })
    ).toEqual(result)
    expect(
      computeAuthOptions({
        scope: 'address'
      })
    ).toEqual(result)
  })

  test('with specific scope', () => {
    const result = {
      display: 'page',
      responseType: 'token',
      scope: 'openid profile'
    }
    expect(
      computeAuthOptions({
        fetchBasicProfile: false,
        scope: ['openid', 'profile']
      })
    ).toEqual(result)
    expect(
      computeAuthOptions({
        fetchBasicProfile: false,
        scope: 'openid profile'
      })
    ).toEqual(result)
  })

  // popup mode is only allowed in social login
  test('popup mode when accepted', () => {
    expect(computeAuthOptions({ popupMode: true }, { acceptPopupMode: true })).toEqual({
      display: 'popup',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
  })

  test('popup mode when refused', () => {
    expect(computeAuthOptions({ popupMode: true })).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
  })

  test('with refresh token required', () => {
    expect(
      computeAuthOptions({
        requireRefreshToken: true
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone offline_access'
    })
  })

  test('origin', () => {
    expect(
      computeAuthOptions({
        origin: 'single'
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone',
      origin: 'single',
    })
  })

  test('accessToken', () => {
    expect(
      computeAuthOptions({
        accessToken: 'abc.123.def'
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone',
      accessToken: 'abc.123.def',
    })
  })
})

// TODO accessToken
