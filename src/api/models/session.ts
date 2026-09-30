/**
 * SSO session state and the devices holding a session.
 */
/** Every field but `isAuthenticated` is only returned when there is an SSO session. */
export type SessionInfo = {
  /** `false` when there is no SSO session, or when it has expired. */
  isAuthenticated: boolean
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
  ip: string
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

/** Requires the `session` scope. */
export type SessionDeviceListResponse = {
  sessionDevices: SessionDevice[]
}
