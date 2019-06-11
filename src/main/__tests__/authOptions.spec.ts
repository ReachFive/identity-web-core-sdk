import { prepareAuthOptions } from '../authOptions'

describe('prepareAuthOptions', () => {
  test('responseType defaults', () => {
    expect(prepareAuthOptions()).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
    expect(prepareAuthOptions({})).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
  })

  test('with redirect uri', () => {
    expect(
      prepareAuthOptions({
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
      prepareAuthOptions({
        scope: ['address']
      })
    ).toEqual(result)
    expect(
      prepareAuthOptions({
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
      prepareAuthOptions({
        fetchBasicProfile: false,
        scope: ['openid', 'profile']
      })
    ).toEqual(result)
    expect(
      prepareAuthOptions({
        fetchBasicProfile: false,
        scope: 'openid profile'
      })
    ).toEqual(result)
  })

  test('popup mode when accepted', () => {
    expect(prepareAuthOptions({ popupMode: true }, { acceptPopupMode: true })).toEqual({
      display: 'popup',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
  })

  test('popup mode when refused', () => {
    expect(prepareAuthOptions({ popupMode: true })).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone'
    })
  })

  test('with refresh token required', () => {
    expect(
      prepareAuthOptions({
        requireRefreshToken: true
      })
    ).toEqual({
      display: 'page',
      responseType: 'token',
      scope: 'openid profile email phone offline_access'
    })
  })
})
