/**
 * SSO session state and the devices holding a session.
 */
export type SessionInfo = {
  isAuthenticated: true
  name?: string
  email?: string
  lastLoginType?: string
  hasPassword?: boolean
  socialProviders?: string[]
}

export type TokenType = 'ST' | 'RT'

export type SessionDevice = {
  id: string
  tokenType: TokenType
  ip?: string
  country?: string
  city?: string
  operatingSystem?: string
  userAgentName?: string
  deviceClass?: string
  deviceName?: string
  createdAt: string
  lastConnection: string
  expiresAt: string
}

export type SessionDeviceListResponse = {
  sessionDevices: SessionDevice[]
}
