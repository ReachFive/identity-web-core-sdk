import isObject from 'lodash-es/isObject'
import isArray from 'lodash-es/isArray'
import reduce from 'lodash-es/reduce'
import camelCase from 'lodash-es/camelCase'
import lodashSnakeCase from 'lodash-es/snakeCase'

export const snakeCasePath = (path: string) => path.split('.').map(snakeCase).join('.')
export const camelCasePath = (path: string) => path.split('.').map(camelCase).join('.')

export const camelCaseProperties = (object: object) => transformObjectProperties(object, camelCase)
export const snakeCaseProperties = (object: object) => transformObjectProperties(object, snakeCase)

function transformObjectProperties(object: object, transform: (path: string) => string): object {
  if (isArray(object)) {
    return object.map(o => transformObjectProperties(o, transform))
  } else if (isObject(object)) {
    return reduce(object, (acc, value, key) => {
      acc[transform(key)] = transformObjectProperties(value, transform)
      return acc
    }, {} as Record<string, unknown>)
  } else {
    return object
  }
}

/* reuse lodash as it covers most cases, but we want the same behavior as the
   snakecasing strategy on the server where numbers are not separated from non numbers.  */
function snakeCase(input: string) {
  return lodashSnakeCase(input).replace(/\_\d/g, dashNumber => dashNumber.slice(1))
}