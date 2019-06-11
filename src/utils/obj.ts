export function Set<K extends string>(...keys: K[]): Record<K, true | undefined> {
  const result = {} as Record<K, true | undefined>
  keys.forEach(key => (result[key] = true))
  return result
}

export function keys<K extends string, V>(obj: Record<K, V>): K[] {
  return Object.keys(obj) as K[]
}
