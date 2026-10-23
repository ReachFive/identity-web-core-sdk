import { postWithNavigation } from '../postNavigation'

const submit = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {})

beforeEach(() => {
  submit.mockClear()
  document.body.innerHTML = ''
})

const submittedForm = () => submit.mock.contexts[0] as HTMLFormElement

const fieldsOf = (form: HTMLFormElement) =>
  Array.from(form.querySelectorAll('input')).map((input) => [input.type, input.name, input.value])

describe('postWithNavigation', () => {
  test('submits a hidden POST form attached to the document', () => {
    postWithNavigation('https://local.reach5.net/identity/v1/endpoint', { key: 'value' })

    expect(submit).toHaveBeenCalledTimes(1)
    const form = submittedForm()
    // The browser does not submit a form detached from the document
    expect(form.isConnected).toBe(true)
    expect(form.method).toBe('post')
    expect(form.action).toBe('https://local.reach5.net/identity/v1/endpoint')
    expect(form.style.display).toBe('none')
    expect(fieldsOf(form)).toEqual([['hidden', 'key', 'value']])
  })

  test('snake cases the keys and flattens nested objects with a dot notation', () => {
    postWithNavigation('https://local.reach5.net/endpoint', {
      rawId: 'raw-id',
      response: { clientDataJSON: 'client-data', authenticatorData: 'authenticator-data' }
    })

    expect(fieldsOf(submittedForm())).toEqual([
      ['hidden', 'raw_id', 'raw-id'],
      ['hidden', 'response.client_data_json', 'client-data'],
      ['hidden', 'response.authenticator_data', 'authenticator-data']
    ])
  })

  test('repeats the key of arrays, stringifies scalars and leaves out empty values', () => {
    postWithNavigation('https://local.reach5.net/endpoint', {
      scopes: ['openid', 'email'],
      count: 2,
      enabled: true,
      missing: undefined,
      empty: null
    })

    expect(fieldsOf(submittedForm())).toEqual([
      ['hidden', 'scopes', 'openid'],
      ['hidden', 'scopes', 'email'],
      ['hidden', 'count', '2'],
      ['hidden', 'enabled', 'true']
    ])
  })

  test('submits the form to the frame named by the target, and removes it as the page stays', () => {
    postWithNavigation('https://local.reach5.net/endpoint', { key: 'value' }, 'frame-name')

    expect(submit).toHaveBeenCalledTimes(1)
    expect(submittedForm().target).toBe('frame-name')
    expect(document.querySelector('form')).toBeNull()
  })
})
