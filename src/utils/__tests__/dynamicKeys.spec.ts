/**
 * @jest-environment node
 */
import { camelCaseProperties, snakeCaseProperties } from '../transformObjectProperties'

describe('objects whose keys are data', () => {
  test('custom field values are left entirely untouched, in both directions', () => {
    expect(camelCaseProperties({ custom_fields: { my_obj: { some_key: 1, otherKey: 2 } } })).toEqual({
      customFields: { my_obj: { some_key: 1, otherKey: 2 } }
    })
    expect(snakeCaseProperties({ customFields: { my_obj: { some_key: 1, otherKey: 2 } } })).toEqual({
      custom_fields: { my_obj: { some_key: 1, otherKey: 2 } }
    })
  })

  test('consents keep their keys and have their fields converted, in both directions', () => {
    expect(
      camelCaseProperties({ consents: { optin_news: { consent_type: 'opt-in', consent_version: { version_id: 2 } } } })
    ).toEqual({ consents: { optin_news: { consentType: 'opt-in', consentVersion: { versionId: 2 } } } })
    expect(snakeCaseProperties({ consents: { optin_news: { consentType: 'opt-in' } } })).toEqual({
      consents: { optin_news: { consent_type: 'opt-in' } }
    })
  })

  test('custom providers keep keys the heuristic would corrupt', () => {
    expect(camelCaseProperties({ custom_providers: { x_2: { btn_text_color: '#fff' }, a__b: {} } })).toEqual({
      customProviders: { x_2: { btnTextColor: '#fff' }, a__b: {} }
    })
  })

  test('client ids keep their case', () => {
    expect(camelCaseProperties({ long_lived_by_client: { kqIJEa7Bx9Zt2LmQpR4s: 1 } })).toEqual({
      longLivedByClient: { kqIJEa7Bx9Zt2LmQpR4s: 1 }
    })
  })

  test('applies at any depth, including inside arrays', () => {
    expect(camelCaseProperties({ addresses: [{ street_address: 'x', custom_fields: { door_code: '1' } }] })).toEqual({
      addresses: [{ streetAddress: 'x', customFields: { door_code: '1' } }]
    })
  })

  test('converts the same names when they hold arrays of definitions, as /identity/v1/config does', () => {
    expect(
      camelCaseProperties({
        custom_fields: [{ path: 'loyalty_card', data_type: 'string', name_translations: [{ lang_code: 'fr' }] }],
        consents: [{ key: 'optin_news', consent_type: 'opt-in' }]
      })
    ).toEqual({
      customFields: [{ path: 'loyalty_card', dataType: 'string', nameTranslations: [{ langCode: 'fr' }] }],
      consents: [{ key: 'optin_news', consentType: 'opt-in' }]
    })
  })

  test('matches a rule whichever casing the caller used for its key', () => {
    expect(snakeCaseProperties({ custom_fields: { myField: 1 } })).toEqual({ custom_fields: { myField: 1 } })
  })

  test('is not fooled by a polluted Object.prototype', () => {
    Object.defineProperty(Object.prototype, 'givenName', { value: 'opaque', configurable: true })
    try {
      expect(camelCaseProperties({ given_name: { first_part: 'x' } })).toEqual({ givenName: { firstPart: 'x' } })
    } finally {
      delete (Object.prototype as Record<string, unknown>).givenName
    }
  })
})
