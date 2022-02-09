import createEventManager from '../identityEventManager'
import createUrlParser from '../urlParser'

function createServices() {
  const eventManager = createEventManager()
  const urlParser = createUrlParser(eventManager)
  return { eventManager, urlParser }
}

describe('parseUrlFragment', () => {
  test('with success url', () => {
    expect.assertions(3)

    // Given
    const { eventManager, urlParser } = createServices()

    const idToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Pd6t82tPL3EZdkeYxw_DV2KimE1U2FvuLHmfR_mimJ5US3JFU4J2Gd94O7rwpSTGN1B9h-_lsTebo4ua4xHsTtmczZ9xa8a_kWKaSkqFjNFaFp6zcoD6ivCu03SlRqsQzSRHXo6TKbnqOt9D6Y2rNa3C4igSwoS0jUE4BgpXbc0'
    const accessToken = 'kjbsdfljndvlksndfv'
    const expiresIn = 1800
    const tokenType = 'Bearer'

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    eventManager.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    eventManager.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = urlParser.checkUrlFragment(
      'https://example.com/login/callback#' +
        [
          `id_token=${idToken}`,
          `access_token=${accessToken}`,
          `expires_in=${expiresIn}`,
          `token_type=${tokenType}`,
        ].join('&')
    )

    // Then
    expect(result).toBe(true)
    expect(authenticatedHandler).toHaveBeenCalledWith({
      idToken,
      idTokenPayload: {
        sub: '1234567890',
        name: 'John Doe',
      },
      accessToken,
      expiresIn,
      tokenType,
    })
    expect(authenticationFailedHandler).not.toHaveBeenCalled()
  })

  test('with error url', () => {
    expect.assertions(3)

    // Given
    const { eventManager, urlParser } = createServices()

    const error = 'invalid_grant'
    const errorDescription = 'Invalid email or password'
    const errorUsrMsg = 'Invalid email or password'

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    eventManager.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    eventManager.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = urlParser.checkUrlFragment(
      'https://example.com/login/callback#' +
        [`error=${error}`, `error_description=${errorDescription}`, `error_usr_msg=${errorUsrMsg}`].join('&')
    )

    // Then
    expect(result).toBe(true)
    expect(authenticatedHandler).not.toHaveBeenCalled()
    expect(authenticationFailedHandler).toHaveBeenCalledWith({
      error,
      errorDescription,
      errorUsrMsg,
    })
  })

  test('with url to be ignored', () => {
    expect.assertions(3)

    // Given
    const { eventManager, urlParser } = createServices()

    const authenticatedHandler = jest.fn().mockName('authenticatedHandler')
    eventManager.on('authenticated', authenticatedHandler)

    const authenticationFailedHandler = jest.fn().mockName('authenticationFailedHandler')
    eventManager.on('authentication_failed', authenticationFailedHandler)

    // When
    const result = urlParser.checkUrlFragment('https://example.com/login/callback#toto=tutu')

    // Then
    expect(result).toBe(false)
    expect(authenticatedHandler).not.toHaveBeenCalled()
    expect(authenticationFailedHandler).not.toHaveBeenCalled()
  })
})
