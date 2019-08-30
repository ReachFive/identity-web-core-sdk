export type Profile = Record<string, any>

export type ProfileAddress = {
  title?: string
  isDefault?: boolean
  addressType?: 'billing' | 'delivery'
  streetAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
  raw?: string
  deliveryNote?: string
  recipient?: string
  company?: string
  phoneNumber?: string
}

export type SignupProfile = {
  password: string
  email?: string
  phoneNumber?: string
  givenName?: string
  middleName?: string
  familyName?: string
  name?: string
  nickname?: string
  birthdate?: string
  profileURL?: string
  picture?: string
  username?: string
  gender?: string
  addresses?: ProfileAddress[]
  locale?: string
  bio?: string
  customFields?: Record<string, any>
  consents?: Record<string, any>
  tosAcceptedAt?: string
  company?: string
  liteOnly?: boolean
}

export type SessionInfo = {
  isAuthenticated: true
  name?: string
  email?: string
  lastLoginType?: string
  hasPassword?: boolean
  socialProviders?: string[]
}

/**
 * This type represents the settings of a ReachFive account's stored in the backend.
 */
export type RemoteSettings = {
  sso: boolean
  language: string
}

export type ErrorResponse = {
  error: string
  errorDescription?: string
  errorUserMsg?: string
  errorDetails?: FieldError[]
}

export type FieldError = {
  field: string
  message: string
  code: 'missing' | 'invalid'
}

export namespace ErrorResponse {
  export function isErrorResponse(thing: any): thing is ErrorResponse {
    return thing && thing.error
  }
}
