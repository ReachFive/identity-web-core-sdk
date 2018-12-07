import fetchMock from "jest-fetch-mock"
import { Config, createClient } from '../main'
import { RemoteSettings } from '../remoteSettings'

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

const jsonHeader = { 'Content-Type': 'application/json;charset=UTF-8' }
const defaultLangHeader = { 'Accept-Language': 'en' }
export const headers = {
  json: jsonHeader,
  defaultLang: defaultLangHeader,
  jsonAndDefaultLang: {
    ...jsonHeader,
    ...defaultLangHeader
  }
}
