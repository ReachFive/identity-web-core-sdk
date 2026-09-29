import fetchMock from 'jest-fetch-mock'

import { createClient } from '../main'
import { defineWindowProperty, mockWindowCrypto } from './helpers/testHelpers'

// Payloads below are shaped exactly as the API sends them. The existing specs mock responses with camelCase
// keys, which the conversion leaves untouched, so they could not catch any of these.

const domain = 'local.reach5.net'
const clientId = 'kqIJEa7Bx9Zt2LmQpR4s'
const accessToken = 'W8ub2c0Lm1lIiwic3ViIjoiQVdYMmdFeWswOTB'

const wireConfig = {
  sso: false,
  sms: false,
  web_authn: false,
  language: 'en',
  pkce_enforced: false,
  is_public: false,
  is_implicit_flow_forbidden: false,
  social_providers: [],
  custom_providers: {
    my_provider: { key: 'my_provider', name: 'Mine', btn_text_color: '#fff' },
    x_2: { key: 'x_2', name: 'X2' }
  },
  password_policy: { minLength: 8, minStrength: 2, allowUpdateWithAccessTokenOnly: true },
  consents: [{ key: 'optin_news', title: 'News', consent_type: 'opt-in', status: 'active' }],
  custom_fields: [
    {
      path: 'loyalty_card',
      name: 'Loyalty card',
      name_translations: [{ lang_code: 'fr', label: 'Carte' }],
      data_type: 'select',
      selectable_values: [{ value: 'gold', label: 'Gold', translations: [{ lang_code: 'fr', label: 'Or' }] }],
      read_scope: []
    }
  ],
  address_fields: [{ path: 'door_code', name: 'Door code', data_type: 'string' }],
  resource_base_url: `https://${domain}/hassets/sdk`,
  mfa_email_enabled: false,
  mfa_sms_enabled: false,
  rba_enabled: false,
  login_type_allowed: { email: true, phone_number: true, custom_identifier: true }
}

function client() {
  fetchMock.mockResponseOnce(JSON.stringify(wireConfig))
  return createClient({ clientId, domain })
}

function lastRequestBody() {
  const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]
  return JSON.parse(init?.body as string)
}

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  jest.resetAllMocks()
  fetchMock.resetMocks()
})

describe('remote settings', () => {
  test('keeps custom provider keys exactly as configured', async () => {
    const { customProviders } = await client().remoteSettings

    expect(Object.keys(customProviders ?? {})).toEqual(['my_provider', 'x_2'])
    expect(customProviders?.my_provider).toEqual({ key: 'my_provider', name: 'Mine', btnTextColor: '#fff' })
  })

  test('camel-cases custom field definitions, as their type declares', async () => {
    const { customFields } = await client().remoteSettings

    expect(customFields).toEqual([
      {
        path: 'loyalty_card',
        name: 'Loyalty card',
        nameTranslations: [{ langCode: 'fr', label: 'Carte' }],
        dataType: 'select',
        selectableValues: [{ value: 'gold', label: 'Gold', translations: [{ langCode: 'fr', label: 'Or' }] }],
        readScope: []
      }
    ])
  })

  test('camel-cases address field definitions the same way', async () => {
    const { addressFields } = await client().remoteSettings

    expect(addressFields).toEqual([{ path: 'door_code', name: 'Door code', dataType: 'string' }])
  })

  test('camel-cases consent definitions, as their type declares', async () => {
    const { consents } = await client().remoteSettings

    expect(consents).toEqual([{ key: 'optin_news', title: 'News', consentType: 'opt-in', status: 'active' }])
  })

  test('leaves the password policy, already sent in camelCase, as is', async () => {
    const { passwordPolicy } = await client().remoteSettings

    expect(passwordPolicy).toEqual({ minLength: 8, minStrength: 2, allowUpdateWithAccessTokenOnly: true })
  })
})

describe('profile', () => {
  const wireProfile = {
    id: 'AVPw',
    given_name: 'John',
    custom_fields: { loyalty_card: 'gold', my_obj: { someKey: 1, other_key: 2 } },
    consents: {
      optin_news: {
        granted: true,
        consent_type: 'opt-in',
        date: '2026-01-01',
        consent_version: { version_id: 2, language: 'fr' }
      }
    },
    addresses: [{ street_address: '1 rue X', custom_fields: { door_code: '12A' } }],
    token_revocation_record: {
      all_long_lived: '2026-01-01T00:00:00Z',
      long_lived_by_client: { [clientId]: '2026-01-02T00:00:00Z' }
    }
  }

  test('keeps custom field values, consent keys and client ids, and camel-cases everything else', async () => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(JSON.stringify(wireProfile))

    const profile = await api.getUser({ accessToken, fields: 'id' })

    expect(profile).toEqual({
      id: 'AVPw',
      givenName: 'John',
      customFields: { loyalty_card: 'gold', my_obj: { someKey: 1, other_key: 2 } },
      consents: {
        optin_news: {
          granted: true,
          consentType: 'opt-in',
          date: '2026-01-01',
          consentVersion: { versionId: 2, language: 'fr' }
        }
      },
      addresses: [{ streetAddress: '1 rue X', customFields: { door_code: '12A' } }],
      tokenRevocationRecord: {
        allLongLived: '2026-01-01T00:00:00Z',
        longLivedByClient: { [clientId]: '2026-01-02T00:00:00Z' }
      }
    })
  })

  test('sends custom field values untouched, and consents with their keys kept and their fields snake-cased', async () => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await api.updateProfile({
      accessToken,
      data: {
        givenName: 'John',
        customFields: { loyalty_card: 'gold', my_obj: { someKey: 1 } },
        consents: { optin_news: { granted: true, consentType: 'opt-in', date: '2026-01-01' } },
        addresses: [{ streetAddress: '1 rue X', customFields: { door_code: '12A' } }]
      }
    })

    expect(lastRequestBody()).toEqual({
      given_name: 'John',
      custom_fields: { loyalty_card: 'gold', my_obj: { someKey: 1 } },
      consents: { optin_news: { granted: true, consent_type: 'opt-in', date: '2026-01-01' } },
      addresses: [{ street_address: '1 rue X', custom_fields: { door_code: '12A' } }]
    })
  })

  test('signup sends the profile data with the same rules', async () => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(JSON.stringify({ id: '1234' }))

    await api.signup({
      data: {
        email: 'john@example.com',
        password: 'p4ssw0rd!',
        customFields: { my_obj: { someKey: 1 } },
        consents: { optin_news: { granted: true, consentType: 'opt-in', date: '2026-01-01' } }
      }
    })

    expect(lastRequestBody().data).toEqual({
      email: 'john@example.com',
      password: 'p4ssw0rd!',
      custom_fields: { my_obj: { someKey: 1 } },
      consents: { optin_news: { granted: true, consent_type: 'opt-in', date: '2026-01-01' } }
    })
  })

  test('signup data keeps custom field values', async () => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(
      JSON.stringify({ sub: 'AVPw', given_name: 'John', custom_fields: { my_obj: { someKey: 1 } } })
    )

    await expect(api.getSignupData('signup-token')).resolves.toEqual({
      sub: 'AVPw',
      givenName: 'John',
      customFields: { my_obj: { someKey: 1 } }
    })
  })
})

describe('other paths carrying profile data', () => {
  const data = {
    email: 'john@example.com',
    password: 'p4ssw0rd!',
    customFields: { my_obj: { someKey: 1 } }
  }
  const wireData = { email: 'john@example.com', password: 'p4ssw0rd!', custom_fields: { my_obj: { someKey: 1 } } }

  test('cordova signup-token keeps custom field values', async () => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(JSON.stringify({}))
    defineWindowProperty('cordova', {})
    try {
      await api.signup({ data })
    } finally {
      delete (window as { cordova?: unknown }).cordova
    }

    expect(fetchMock.mock.calls[1][0]).toBe(`https://${domain}/identity/v1/signup-token`)
    expect(lastRequestBody().data).toEqual(wireData)
  })

  test('WebAuthn signup keeps custom field values of the profile', async () => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(JSON.stringify({ options: { public_key: {} } }))
    defineWindowProperty('PublicKeyCredential', {})
    try {
      // The browser credential step fails under jsdom; only the options request matters here.
      await api.signupWithWebAuthn({ profile: data }).catch(() => undefined)
    } finally {
      delete (window as { PublicKeyCredential?: unknown }).PublicKeyCredential
    }

    expect(fetchMock.mock.calls[1][0]).toBe(`https://${domain}/identity/v1/webauthn/signup-options`)
    expect(lastRequestBody().profile).toEqual(wireData)
  })

  test.each([
    ['updateEmail', { accessToken, email: 'new@example.com' }],
    ['updatePhoneNumber', { accessToken, phoneNumber: '+33600000000' }],
    ['unlink', { accessToken, identityId: 'x' }]
  ] as const)('%s resolves with the returned profile, custom field values kept', async (method, params) => {
    const api = client()
    await api.remoteSettings
    fetchMock.mockResponseOnce(JSON.stringify({ given_name: 'John', custom_fields: { my_obj: { someKey: 1 } } }))

    await expect((api[method] as (p: typeof params) => Promise<unknown>)(params)).resolves.toEqual({
      givenName: 'John',
      customFields: { my_obj: { someKey: 1 } }
    })
  })
})
