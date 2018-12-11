import { camelCaseProperties } from '../utils/transformObjectProperties'

export function ajax<DATA = undefined>(params: { url: string } & RequestInit): Promise<DATA> {
  const { url, ...options } = params
  return fetch(url, options).then(response => {
    if (response.status != 204) {
      const dataP = response.json().then(camelCaseProperties) as any as Promise<DATA>
      return response.ok ? dataP : dataP.then(data => Promise.reject(data))
    }
    return undefined as any as DATA
  })
}