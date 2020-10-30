import fetchMock from 'jest-fetch-mock'

import { Config, createClient } from '../main'
import { RemoteSettings } from '../models'
import { toQueryString } from '../../utils/queryString'
import { delay } from '../../utils/promise'

export function createDefaultTestClient(remoteSettings: Partial<RemoteSettings> = {}) {
  const actualRemoteSettings = {
    sso: false,
    pkceEnforced: false,
    language: 'en',
    ...remoteSettings
  }

  // Mocks the initial config fetching
  fetchMock.mockResponseOnce(JSON.stringify(actualRemoteSettings), { status: 200 })

  const clientId = 'ijzdfpidjf'
  const domain = 'local.reach5.net'
  const api = createClient({ clientId, domain })
  return { api, clientId, domain }
}

export function createTestClient(config: Config, remoteSettings: Partial<RemoteSettings> = {}) {
  const actualRemoteSettings = {
    sso: false,
    pkceEnforced: false,
    language: config.language,
    ...remoteSettings
  }

  // Mocks the initial config fetching
  fetchMock.mockResponseOnce(JSON.stringify(actualRemoteSettings), { status: 200 })

  return createClient(config)
}

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

export async function expectIframeWithParams(
  domain: string,
  params: {}
) {
  await delay(10)
  const iframe = document.querySelector('iframe')
  expect(iframe).not.toBeNull()
  if (iframe) {
    // Make Typescript happy
    expect(iframe.getAttribute('height')).toEqual('0')
    expect(iframe.getAttribute('width')).toEqual('0')
    expect(iframe.getAttribute('src')).toEqual(
      `https://${domain}/oauth/authorize?${toQueryString(params)}`
    )
  } else fail('No iframe found!')
}

export const mockPkceWindow = {
  getRandomValues: (_: Uint8Array) => Uint8Array.from([
    232,13,106,142,120,103,229,207,154,233,25,115,160,208,85,59,40,124,18,56,69,251,83,63,102,164,125,65,53,14,213,172
  ]),
  subtle: {
    digest: (_: AlgorithmIdentifier, __: ArrayBuffer) => Promise.resolve(
      Uint8Array.from([
        40,17,208,1,36,3,28,43,86,140,49,149,25,6,143,142,194,188,115,196,165,172,125,178,126,109,231,66,30,249,163,94
      ]).buffer
    )
  },
}

export const mockPkceValues = {
  code_challenge: 'KBHQASQDHCtWjDGVGQaPjsK8c8SlrH2yfm3nQh75o14',
  code_challenge_method: 'S256',
}
