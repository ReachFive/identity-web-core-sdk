import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, headers } from './helpers/testHelpers'
import { storeStepUpContext } from '../stepUpContextService'
import { setWithExpiry } from '../../utils/sessionStorage'

const submit = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {})
const getCredentials = jest.fn<Promise<Credential | null>, [CredentialRequestOptions?]>()

const bytes = (...values: number[]) => new Uint8Array(values).buffer

const assertion = {
  id: 'credential-id',
  type: 'public-key',
  rawId: bytes(1, 2, 3),
  response: {
    authenticatorData: bytes(4, 5, 6),
    clientDataJSON: bytes(7, 8, 9),
    signature: bytes(10, 11, 12),
    userHandle: bytes(13, 14, 15)
  }
} as unknown as PublicKeyCredential

const stepUpOptions = {
  public_key: {
    challenge: 'AQID',
    rp_id: 'local.reach5.net',
    allow_credentials: [{ id: 'BAUG', type: 'public-key' }],
    user_verification: 'required'
  }
}

beforeAll(() => {
  fetchMock.enableMocks()
  // A browser supporting conditional mediation, which the step-up does not use anyway
  defineWindowProperty('PublicKeyCredential', { isConditionalMediationAvailable: () => Promise.resolve(true) })
  Object.defineProperty(navigator, 'credentials', { value: { get: getCredentials }, configurable: true })
})

beforeEach(() => {
  fetchMock.resetMocks()
  submit.mockClear()
  getCredentials.mockReset()
  document.body.innerHTML = ''
  localStorage.clear()
  sessionStorage.clear()
})

const submittedForm = () => submit.mock.contexts[0] as HTMLFormElement

describe('achieveStepUpWithWebAuthn', () => {
  test('posts the assertion through a form navigation, so that the page follows the redirection', async () => {
    const { client, clientId, domain } = createDefaultTestClient()
    const stepUpOptionsCall = fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(assertion)

    await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).resolves.toEqual({})

    expect(stepUpOptionsCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/webauthn/stepup/options`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({ origin: 'http://localhost', step_up_token: 'step-up-token' })
    })
    // Modal request, even though the browser supports conditional mediation
    expect(getCredentials).toHaveBeenCalledWith({ publicKey: expect.anything(), signal: undefined })

    // The verification is not fetched: only the config and the options were
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(submit).toHaveBeenCalledTimes(1)
    const form = submittedForm()
    expect(form.method).toBe('post')
    expect(form.action).toBe(`https://${domain}/identity/v1/webauthn/stepup/verify`)
    expect(Object.fromEntries(new FormData(form))).toEqual({
      id: 'credential-id',
      raw_id: 'AQID',
      type: 'public-key',
      'response.authenticator_data': 'BAUG',
      'response.client_data_json': 'BwgJ',
      'response.signature': 'CgsM',
      'response.user_handle': 'DQ4P',
      client_id: clientId
    })
  })

  test('submits the redirect URI of the step-up request, for the server to redirect a failure to it', async () => {
    const { client, clientId } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(assertion)
    storeStepUpContext('step-up-token', { redirectUri: 'https://example.com/callback' })

    await client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })

    const form = submittedForm()
    // Not in web message mode: the page navigates
    expect(form.target).toBe('')
    expect(Object.fromEntries(new FormData(form))).toEqual(
      expect.objectContaining({ client_id: clientId, redirect_uri: 'https://example.com/callback' })
    )
  })

  test('removes the context once the page navigates to the verification', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(assertion)
    storeStepUpContext('step-up-token', { redirectUri: 'https://example.com/callback' })

    await client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })

    expect(submit).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('stepup_context:step-up-token')).toBeNull()
  })

  test('keeps the context when the step-up fails before the verification, for a new attempt', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(null)
    storeStepUpContext('step-up-token', { redirectUri: 'https://example.com/callback' })

    await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).rejects.toThrow(
      'Unable to stepup with invalid public key credentials.'
    )

    expect(localStorage.getItem('stepup_context:step-up-token')).not.toBeNull()
  })

  test('sends the orchestration token along with the options request in an orchestrated flow', async () => {
    const originalLocation = window.location
    defineWindowProperty('location', { origin: 'http://localhost', search: 'r5_request_token=orchestratedtoken' })
    try {
      const { client, domain } = createDefaultTestClient()
      const stepUpOptionsCall = fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)

      await client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })

      expect(stepUpOptionsCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/webauthn/stepup/options`, {
        method: 'POST',
        headers: expect.objectContaining(headers.jsonAndDefaultLang),
        body: JSON.stringify({
          origin: 'http://localhost',
          step_up_token: 'step-up-token',
          r5_request_token: 'orchestratedtoken'
        })
      })
    } finally {
      defineWindowProperty('location', originalLocation)
    }
  })

  test('submits the trust device choice with the assertion', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(assertion)

    await client.achieveStepUpWithWebAuthn({
      stepUpToken: 'step-up-token',
      trustDevice: true
    })

    expect(submit).toHaveBeenCalledTimes(1)
    expect(Object.fromEntries(new FormData(submittedForm()))).toEqual(
      expect.objectContaining({ id: 'credential-id', trust_device: 'true' })
    )
  })

  test('does not submit anything without a credential', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(null)

    await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).rejects.toThrow(
      'Unable to stepup with invalid public key credentials.'
    )
    expect(submit).not.toHaveBeenCalled()
  })

  test('does not start the ceremony when the options request fails', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid step up token' }), {
      status: 400
    })

    await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).rejects.toEqual({
      error: 'invalid_grant',
      errorDescription: 'Invalid step up token'
    })
    expect(getCredentials).not.toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })

  describe('ends the authorization flow it belongs to, by releasing its locks', () => {
    // As taken by a login requiring MFA, which leaves them to the step-up
    const lockAuthorizationFlow = () => {
      setWithExpiry('authorize_state', 'state', 20000)
      setWithExpiry('session_state', 'state', 20000)
    }

    test('before the page navigates in redirect mode', async () => {
      const { client } = createDefaultTestClient()
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      lockAuthorizationFlow()

      await client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })

      expect(submit).toHaveBeenCalledTimes(1)
      expect(sessionStorage.getItem('authorize_state')).toBeNull()
      expect(sessionStorage.getItem('session_state')).toBeNull()
    })

    test('when the step-up fails', async () => {
      const { client } = createDefaultTestClient()
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(null)
      lockAuthorizationFlow()

      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).rejects.toThrow(
        'Unable to stepup with invalid public key credentials.'
      )

      expect(sessionStorage.getItem('authorize_state')).toBeNull()
      expect(sessionStorage.getItem('session_state')).toBeNull()
    })
  })

  describe('in web message mode', () => {
    const webMessage = (origin: string, response: object) =>
      new MessageEvent('message', { origin, data: { type: 'authorization_response', response } })

    // The name of the iframe the form was submitted to, as it is removed once the response is received
    let iframeName: string | undefined

    const answerWithWebMessages = (...messages: MessageEvent[]) =>
      submit.mockImplementationOnce(() => {
        iframeName = document.querySelector('iframe')?.name
        messages.forEach((message) => window.dispatchEvent(message))
      })

    const answerWithWebMessage = (origin: string, response: object) =>
      answerWithWebMessages(webMessage(origin, response))

    beforeEach(() => {
      iframeName = undefined
    })

    test('posts the assertion to an iframe, and resolves with the posted authorization response', async () => {
      const { client, domain } = createDefaultTestClient({ isPublic: false })
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      storeStepUpContext('step-up-token', { responseMode: 'web_message', redirectUri: 'https://example.com/callback' })
      answerWithWebMessage(`https://${domain}`, { code: 'step-up-code' })

      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).resolves.toEqual({
        code: 'step-up-code'
      })

      const form = submittedForm()
      expect(form.action).toBe(`https://${domain}/identity/v1/webauthn/stepup/verify`)
      // The iframe navigates, not the page
      expect(iframeName).toMatch(/^wm/)
      expect(form.target).toBe(iframeName)
      // The iframe is removed once the response is received
      expect(document.querySelector('iframe')).toBeNull()
      expect(Object.fromEntries(new FormData(form))).toEqual(
        expect.objectContaining({ id: 'credential-id', redirect_uri: 'https://example.com/callback' })
      )
      // The step-up is over: its context is no longer needed
      expect(localStorage.getItem('stepup_context:step-up-token')).toBeNull()
    })

    test('exchanges the code of a public client with the redirect URI of the step-up request', async () => {
      const { client, domain } = createDefaultTestClient({ isPublic: true })
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      storeStepUpContext('step-up-token', { responseMode: 'web_message', redirectUri: 'https://example.com/callback' })
      answerWithWebMessage(`https://${domain}`, { code: 'step-up-code' })
      const tokenCall = fetchMock.mockResponseOnce(JSON.stringify({ access_token: 'access-token' }))

      await client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })

      expect(tokenCall).toHaveBeenLastCalledWith(
        `https://${domain}/oauth/token`,
        expect.objectContaining({
          body: expect.stringContaining('"redirect_uri":"https://example.com/callback"')
        })
      )
    })

    test('keeps the context after a failed verification, so that a new attempt still uses web message', async () => {
      const { client, domain } = createDefaultTestClient({ isPublic: false })
      fetchMock.mockResponse(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      storeStepUpContext('step-up-token', { responseMode: 'web_message', redirectUri: 'https://example.com/callback' })
      answerWithWebMessage(`https://${domain}`, { error: 'invalid_grant', errorDescription: 'Invalid assertion' })

      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).rejects.toEqual({
        error: 'invalid_grant',
        errorDescription: 'Invalid assertion'
      })
      expect(localStorage.getItem('stepup_context:step-up-token')).not.toBeNull()

      answerWithWebMessage(`https://${domain}`, { code: 'step-up-code' })
      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).resolves.toEqual({
        code: 'step-up-code'
      })
      // Both attempts targeted an iframe rather than navigating the page
      expect(submit.mock.contexts.map((form) => (form as HTMLFormElement).target)).toEqual([
        expect.stringMatching(/^wm/),
        expect.stringMatching(/^wm/)
      ])
    })

    test('rejects with the error the server redirected to the redirect URI, and stops listening', async () => {
      const { client, domain } = createDefaultTestClient({ isPublic: false })
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      storeStepUpContext('step-up-token', { responseMode: 'web_message', redirectUri: 'https://example.com/callback' })
      const authenticated = jest.fn()
      client.on('authenticated', authenticated)
      submit.mockImplementationOnce(() => {
        // The frame followed the redirection to the redirect URI, of the same origin as the page
        const iframe = document.querySelector('iframe') as HTMLIFrameElement
        Object.defineProperty(iframe, 'contentWindow', {
          value: { location: { search: '?error=invalid_grant&error_description=Expired+challenge', hash: '' } }
        })
        iframe.dispatchEvent(new Event('load'))
      })

      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).rejects.toEqual({
        error: 'invalid_grant',
        errorDescription: 'Expired challenge'
      })
      expect(document.querySelector('iframe')).toBeNull()

      // A later message is no longer listened to
      window.dispatchEvent(webMessage(`https://${domain}`, { code: 'late-code' }))
      expect(authenticated).not.toHaveBeenCalled()
    })

    test('waits for the message while the frame is on the server, whose page cannot be read', async () => {
      const { client, domain } = createDefaultTestClient({ isPublic: false })
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      storeStepUpContext('step-up-token', { responseMode: 'web_message' })
      submit.mockImplementationOnce(() => {
        const iframe = document.querySelector('iframe') as HTMLIFrameElement
        // The location of a frame of another origin is reachable, but none of its properties can be read
        const crossOriginError = () => {
          throw new DOMException('Blocked a frame from accessing a cross-origin frame', 'SecurityError')
        }
        Object.defineProperty(iframe, 'contentWindow', {
          value: {
            location: {
              get search() {
                return crossOriginError()
              },
              get hash() {
                return crossOriginError()
              }
            }
          }
        })
        iframe.dispatchEvent(new Event('load'))
        window.dispatchEvent(webMessage(`https://${domain}`, { code: 'step-up-code' }))
      })

      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).resolves.toEqual({
        code: 'step-up-code'
      })
    })

    test('ignores the messages of another origin', async () => {
      const { client, domain } = createDefaultTestClient({ isPublic: false })
      fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
      getCredentials.mockResolvedValue(assertion)
      storeStepUpContext('step-up-token', { responseMode: 'web_message' })
      answerWithWebMessages(
        webMessage('https://attacker.example', { code: 'forged-code' }),
        webMessage(`https://${domain}`, { code: 'step-up-code' })
      )

      await expect(client.achieveStepUpWithWebAuthn({ stepUpToken: 'step-up-token' })).resolves.toEqual({
        code: 'step-up-code'
      })
    })
  })
})
