import fetchMock from 'jest-fetch-mock'

import { Config, createClient } from '../main'
import { RemoteSettings } from '../models'
import { toQueryString } from '../../utils/queryString'
import { delay } from '../../utils/promise'

export function createDefaultTestClient(remoteSettings: Partial<RemoteSettings> = {}) {
  const actualRemoteSettings = {
    sso: false,
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
