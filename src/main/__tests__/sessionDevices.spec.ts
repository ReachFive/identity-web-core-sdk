import fetchMock from 'jest-fetch-mock'
import { defineWindowProperty, headers, mockWindowCrypto } from './helpers/testHelpers'
import { popNextRandomString } from './helpers/randomStringMock'
import { createDefaultTestClient } from './helpers/clientFactory'

beforeAll(() => {
  fetchMock.enableMocks()
  defineWindowProperty('location')
  defineWindowProperty('crypto', mockWindowCrypto)
})

beforeEach(() => {
  document.body.innerHTML = ''
  jest.resetAllMocks()
  fetchMock.resetMocks()
  popNextRandomString()
})

test('list session devices', async () => {
  // Given
  const { client, domain } = createDefaultTestClient()
  const accessToken = '456'

  const listSessionDevicesCall = fetchMock.mockResponseOnce(
    JSON.stringify({
      sessionDevices: [
        {
          id: "UUID",
          ip: "192.168.65.1",
          operatingSystem: "Android",
          userAgentName: "Chrome",
          deviceClass: "Phone",
          deviceName: "Google Nexus 6",
          firstConnection: "date1",
          lastConnection: "date2"
        }
      ]
    })
  )

  const result = await client.listSessionDevices(accessToken)

  expect(listSessionDevicesCall).toHaveBeenCalledWith(
    `https://${domain}/identity/v1/session-devices`,
    {
      method: 'GET',
      headers: expect.objectContaining({
        ...headers.accessToken(accessToken)
      })
    }
  )

  expect(result).toEqual({
    sessionDevices: [
      {
        id: "UUID",
        ip: "192.168.65.1",
        operatingSystem: "Android",
        userAgentName: "Chrome",
        deviceClass: "Phone",
        deviceName: "Google Nexus 6",
        firstConnection: "date1",
        lastConnection: "date2"
      }
    ]
  })

})
