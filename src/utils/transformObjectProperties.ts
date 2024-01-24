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

type TransformObjectProperties<T> = T extends (infer U)[]
  ? TransformObjectProperties<U>[]
  : T extends Record<string, unknown>
  ? { [K in keyof T]: TransformObjectProperties<T[K]> }
  : T;

function transformObjectProperties<T>(input: T, transform: (path: string) => string): TransformObjectProperties<T> {
  if (Array.isArray(input)) {
    return input.map(value => transformObjectProperties(value, transform)) as TransformObjectProperties<T>
  }
  if (typeof input === "object" && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => (
        [
          transform(key) as keyof T,
          fieldsNotToConvert.find(s => s === snakeCase(key))
            ? value
            : transformObjectProperties(value, transform)
        ]
      ))
    ) as TransformObjectProperties<T>
  }
  return input as TransformObjectProperties<T>
}

/* reuse lodash as it covers most cases, but we want the same behavior as the
   snakecasing strategy on the server where numbers are not separated from non numbers.  */
function snakeCase(input: string) {
  return lodashSnakeCase(input).replace(/_\d/g, dashNumber => dashNumber.slice(1))
}
