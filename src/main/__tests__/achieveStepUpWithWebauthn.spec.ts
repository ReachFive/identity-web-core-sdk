import fetchMock from 'jest-fetch-mock'
import { createDefaultTestClient } from './helpers/clientFactory'
import { defineWindowProperty, headers } from './helpers/testHelpers'

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
  defineWindowProperty('PublicKeyCredential', { isConditionalMediationAvailable: () => Promise.resolve(false) })
  Object.defineProperty(navigator, 'credentials', { value: { get: getCredentials }, configurable: true })
})

beforeEach(() => {
  fetchMock.resetMocks()
  submit.mockClear()
  getCredentials.mockReset()
  document.body.innerHTML = ''
})

const submittedForm = () => submit.mock.contexts[0] as HTMLFormElement

describe('achieveStepUpWithWebauthn', () => {
  test('posts the assertion through a form navigation, so that the page follows the redirection', async () => {
    const { client, domain } = createDefaultTestClient()
    const stepUpOptionsCall = fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(assertion)

    await expect(
      client.achieveStepUpWithWebauthn({ stepUpToken: 'step-up-token', conditionalMediation: false })
    ).resolves.toEqual({})

    expect(stepUpOptionsCall).toHaveBeenCalledWith(`https://${domain}/identity/v1/webauthn/stepup/options`, {
      method: 'POST',
      headers: expect.objectContaining(headers.jsonAndDefaultLang),
      body: JSON.stringify({ origin: 'http://localhost', step_up_token: 'step-up-token' })
    })
    // Modal request
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
      'response.user_handle': 'DQ4P'
    })
  })

  test('does not submit anything without a credential', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify(stepUpOptions))
    getCredentials.mockResolvedValue(null)

    await expect(
      client.achieveStepUpWithWebauthn({ stepUpToken: 'step-up-token', conditionalMediation: false })
    ).rejects.toThrow('Unable to stepup with invalid public key credentials.')
    expect(submit).not.toHaveBeenCalled()
  })

  test('does not start the ceremony when the options request fails', async () => {
    const { client } = createDefaultTestClient()
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid step up token' }), {
      status: 400
    })

    await expect(
      client.achieveStepUpWithWebauthn({ stepUpToken: 'step-up-token', conditionalMediation: false })
    ).rejects.toEqual({ error: 'invalid_grant', errorDescription: 'Invalid step up token' })
    expect(getCredentials).not.toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })
})
