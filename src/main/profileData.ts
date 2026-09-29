import type { ProfileAddress } from '../api/models'

/**
 * Prepares profile data for the wire: the API names an address's default flag `default`, which the SDK long
 * exposed as `isDefault`. Both are accepted; `default` wins when both are given.
 */
export function toWireProfileData<T extends { addresses?: ProfileAddress[] }>(data: T): T {
  if (!data.addresses) return data
  return {
    ...data,
    addresses: data.addresses.map(({ isDefault, ...address }) =>
      isDefault === undefined || address.default !== undefined ? address : { ...address, default: isDefault }
    )
  }
}
