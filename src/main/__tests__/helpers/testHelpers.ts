import { delay } from '../../../utils/promise'
import '../matchers'

export function defineWindowProperty(propertyKey: string, propertyValue?: object) {
  return Object.defineProperty(window, propertyKey, {
    writable: true,
    value: propertyValue ?? { assign: jest.fn() }
  })
}

// HTTP Headers helpers
// --------------------

const jsonHeader = { 'Content-Type': 'application/json;charset=UTF-8' }
const langHeader = (lang: string) => ({ 'Accept-Language': lang })
const defaultLangHeader = langHeader('en')
const accessTokenHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

export const headers = {
  json: jsonHeader,
  defaultLang: defaultLangHeader,
  lang: langHeader,
  accessToken: accessTokenHeader,
  jsonAndDefaultLang: {
    ...jsonHeader,
    ...defaultLangHeader
  }
}

export async function expectIframeWithParams(iframeId: string, src: string) {
  await delay(5)
  sessionStorage.clear()
  // "wm" needed to make sure the randomized id is valid
  const iframe = document.querySelector('#wm' + iframeId)
  expect(iframe).not.toBeNull()
  if (iframe) {
    expect(iframe.getAttribute('height')).toEqual('0')
    expect(iframe.getAttribute('width')).toEqual('0')
    // expect(iframe.getAttribute('src')).toEqual(src)
    expect(iframe.getAttribute('src')).toMatchURL(src)
  } else fail('No iframe found!')
}

export const mockWindowCrypto = {
  // prettier-ignore
  getRandomValues: (_array: Uint8Array) => Uint8Array.from([
    232,13,106,142,120,103,229,207,154,233,25,115,160,208,85,59,40,124,18,56,69,251,83,63,102,164,125,65,53,14,213,172
  ]),
  randomUUID: () => '36b8f84d-df4e-4d49-b662-bcde71a8764f',
  subtle: {
    digest: (_algorithm: AlgorithmIdentifier, _data: ArrayBuffer) =>
      Promise.resolve(
        // prettier-ignore
        Uint8Array.from([
          40,17,208,1,36,3,28,43,86,140,49,149,25,6,143,142,194,188,115,196,165,172,125,178,126,109,231,66,30,249,163,94
        ]).buffer
      )
  }
}
