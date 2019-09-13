import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import reduce from 'lodash/reduce'
import camelCase from 'lodash/camelCase'
import lodashSnakeCase from 'lodash/snakeCase'

export const snakeCasePath = (path: string) =>
  path
    .split('.')
    .map(snakeCase)
    .join('.')
export const camelCasePath = (path: string) =>
  path
    .split('.')
    .map(camelCase)
    .join('.')

export const camelCaseProperties = (object: object) => transformObjectProperties(object, camelCase)
export const snakeCaseProperties = (object: object) => transformObjectProperties(object, snakeCase)

/**
 * Won't convert the value of the field, but the field key will be converted.
 * The values in this list should be in snake_case.
 */
const fieldsNotToConvert = ['custom_fields', 'consents']

function transformObjectProperties(object: any, transform: (path: string) => string): any {
  if (isArray(object)) {
    return object.map(o => transformObjectProperties(o, transform))
  } else if (isObject(object)) {
    return reduce(
      object,
      (acc, value, key) => {
        acc[transform(key)] = fieldsNotToConvert.find(s => s === snakeCase(key)) ?
          value : transformObjectProperties(value, transform)
        return acc
      },
      {} as Record<string, unknown>
    )
  } else {
    return object
  }
}

/* reuse lodash as it covers most cases, but we want the same behavior as the
   snakecasing strategy on the server where numbers are not separated from non numbers.  */
function snakeCase(input: string) {
  return lodashSnakeCase(input).replace(/\_\d/g, dashNumber => dashNumber.slice(1))
}
