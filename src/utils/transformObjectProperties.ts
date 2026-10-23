import { camelCase, snakeCase as underlingSnakeCase } from './utils'

export const camelCaseProperties = <T>(object: T) => transformObjectProperties(object, camelCase)
export const snakeCaseProperties = <T>(object: T) => transformObjectProperties(object, snakeCaseKey)

export const camelCaseKey = (key: string): string => camelCase(key)

/* Reuse lodash's _.snakeCase behavior as it covers most cases, but we want the same behavior as the
   snakecasing strategy on the server where numbers are not separated from non numbers.  */
export function snakeCaseKey(key: string): string {
  return underlingSnakeCase(key).replace(/_\d/g, (dashNumber) => dashNumber.slice(1))
}

/**
 * How the case conversion treats an object held under a given key.
 *
 * - `'opaque'`: nothing inside is touched — its keys and values are user data.
 * - `'opaqueKeys'`: its own keys are kept — they are data, such as consent keys or client ids — but the
 *   values they hold are converted as usual.
 */
type DynamicKeysRule = 'opaque' | 'opaqueKeys'

/**
 * The API objects whose keys are data rather than schema. Rewriting those keys corrupts them, and some
 * (client ids, `a__b`) cannot even be rewritten back.
 *
 * A rule applies wherever its key appears, at any depth and in both directions, but **only when the value is
 * an object**. The same names also hold arrays of definitions with a fixed schema — the custom fields and
 * consents of `/identity/v1/config` — and those are converted like everything else.
 *
 * Any new API object keyed by data rather than by field names needs an entry here.
 */
const dynamicKeys: Readonly<Record<string, DynamicKeysRule>> = {
  // Custom field values, keyed by account-defined paths, possibly holding objects with keys in any case:
  // profiles, addresses, signup data, the id token.
  customFields: 'opaque',
  // A profile's consents, keyed by consent key, each a `UserConsent` with fixed fields.
  consents: 'opaqueKeys',
  // `/identity/v1/config` custom providers, keyed by a name that may contain `_2` or `__`.
  customProviders: 'opaqueKeys',
  // A profile's token revocations, keyed by mixed-case client id.
  longLivedByClient: 'opaqueKeys'
}

type TransformObjectProperties<T> = T extends (infer U)[]
  ? TransformObjectProperties<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T]: TransformObjectProperties<T[K]> }
    : T

function transformObjectProperties<T>(input: T, transform: (key: string) => string): TransformObjectProperties<T> {
  if (Array.isArray(input)) {
    return input.map((value) => transformObjectProperties(value, transform)) as TransformObjectProperties<T>
  }
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [transform(key), transformValue(key, value, transform)])
    ) as TransformObjectProperties<T>
  }
  return input as TransformObjectProperties<T>
}

function transformValue(key: string, value: unknown, transform: (key: string) => string): unknown {
  const rule = isPlainObject(value) ? ruleFor(key) : undefined
  if (rule === 'opaque') return value
  if (rule === 'opaqueKeys') {
    return Object.fromEntries(
      Object.entries(value as object).map(([dataKey, held]) => [dataKey, transformObjectProperties(held, transform)])
    )
  }
  return transformObjectProperties(value, transform)
}

function ruleFor(key: string): DynamicKeysRule | undefined {
  const name = camelCase(key)
  return Object.prototype.hasOwnProperty.call(dynamicKeys, name) ? dynamicKeys[name] : undefined
}

function isPlainObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
