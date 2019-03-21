import {
  camelCaseProperties,
  snakeCaseProperties,
  camelCasePath,
  snakeCasePath
} from '../transformObjectProperties'


const snakeCaseObject = {
  'given_name': 'Robert',
  'family_name': 'De Niro',
  'age': 73,
  'address': {
    'street_address': 'Sunset Blvd',
    'locality': 'Los Angeles',
    'postal_code': 'CA 90028',
    'country': 'United States'
  },
  'phone_number': '+1 (123) 123-4567',
  'friends': [
    {
      'given_name': 'Martin',
      'family_name': 'Scorsese',
    },
    {
      'given_name': 'Al',
      'family_name': 'Pacino',
    }
  ],
  'tags': [
    'actor',
    'american'
  ],
  'is_alive': true,
  'test3': true
}

const camelCaseObject = {
  'givenName': 'Robert',
  'familyName': 'De Niro',
  'age': 73,
  'address': {
    'streetAddress': 'Sunset Blvd',
    'locality': 'Los Angeles',
    'postalCode': 'CA 90028',
    'country': 'United States'
  },
  'phoneNumber': '+1 (123) 123-4567',
  'friends': [
    {
      'givenName': 'Martin',
      'familyName': 'Scorsese',
    },
    {
      'givenName': 'Al',
      'familyName': 'Pacino',
    }
  ],
  'tags': [
    'actor',
    'american'
  ],
  'isAlive': true,
  'test3': true
}

describe('camelCaseProperties', () => {
  test('simple case', () => {
    expect(camelCaseProperties(snakeCaseObject)).toEqual(camelCaseObject)
    expect(camelCaseProperties(camelCaseObject)).toEqual(camelCaseObject)
  })
})

describe('snakeCaseProperties', () => {
  test('simple case', () => {
    expect(snakeCaseProperties(camelCaseObject)).toEqual(snakeCaseObject)
    expect(snakeCaseProperties(snakeCaseObject)).toEqual(snakeCaseObject)
  })
})

describe('camelCasePath', () => {
  test('basic', () => expect(camelCasePath('foo_bar.toto_titi')).toEqual('fooBar.totoTiti'))
})

describe('snakeCasePath', () => {
  test('basic', () => expect(snakeCasePath('fooBar.totoTiti')).toEqual('foo_bar.toto_titi'))
})
