import { camelCaseProperties } from '../utils/transformObjectProperties'

export function ajax<Result>(params: { url: string } & RequestInit): Promise<Result> {
  const { url, ...options } = params
  return fetch(url, options).then(response => {
    if (response.status !== 204) {
      const dataP = (response.json().then(res => camelCaseProperties(res) as Result))
      return response.ok ? dataP : dataP.then(data => Promise.reject(data))
    }
    return undefined as Result
  })
}
