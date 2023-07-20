import fetchMock from 'jest-fetch-mock'
import { RemoteSettings } from '../../models'
import { Client, Config, createClient } from '../../main'

fetchMock.enableMocks()

export type TestKit = {
  client: Client
  remoteSettings: RemoteSettings
  domain: string,
  clientId: string
}

export function createDefaultTestClient(remoteSettings: Partial<RemoteSettings> = {}): TestKit {
  const actualRemoteSettings = {
    sso: false,
    pkceEnforced: false,
    isPublic: false,
    language: 'en',
    rbaEnabled: false,
    ...remoteSettings,
  }

  const clientId = 'ijzdfpidjf'
  const domain = 'local.reach5.net'
  const configUrl = `https://${domain}/identity/v1/config`

  // Mocks the initial config fetching
  const remoteSettingsCall = fetchMock.mockResponseOnce(JSON.stringify(actualRemoteSettings), { status: 200 })
  const client = createClient({ clientId, domain })
  expect(remoteSettingsCall).toHaveBeenCalledWith(`${configUrl}?client_id=${clientId}`, undefined)

  return {
    client,
    remoteSettings: actualRemoteSettings,
    domain,
    clientId
  }
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
