
export function ajax<DATA = undefined>(params: { url: string } & RequestInit): Promise<DATA> {
  return fetch(params.url, params).then(response => {
    if (response.status == 204) return undefined as any as DATA
    return response.json() as Promise<DATA>
  })
}