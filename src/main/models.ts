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

export type SignupProfileData = {
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
  company?: string
  liteOnly?: boolean
}

export type SignupProfile = SignupProfileData & { password: string }

export type OpenIdUser = {
  sub: string
  name?: string
  givenName?: string
  familyName?: string
  middleName?: string
  nickname?: string
  preferredUsername?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  emailVerified?: boolean
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  address?: ProfileAddress[]
  updatedAt?: number
  customFields?: Record<string, any>
}

export type SessionInfo = {
  isAuthenticated: true
  name?: string
  email?: string
  lastLoginType?: string
  hasPassword?: boolean
  socialProviders?: string[]
}

export type PasswordlessResponse = MFA.ChallengeId

export namespace MFA {
  export type ChallengeId = {
    challengeId?: string
  }

  export function isPhoneCredential(credential: Credential): credential is PhoneCredential {
    return credential.type === 'sms'
  }

  export function isEmailCredential(credential: Credential): credential is EmailCredential {
    return credential.type === 'email'
  }

  type CredentialType = 'sms' | 'email'

  type Credential = {
    type: CredentialType
    createdAt: string
    friendlyName: string
  }

  export type PhoneCredential = Credential & {
    type: 'sms'
    phoneNumber: string
  }

  export type EmailCredential = Credential & {
    type: 'email'
    email: string
  }

  export type CredentialsResponse = {
    credentials: Credential[]
  }

  export type StepUpResponse = {
    amr: string[]
    token: string
  }
}

/**
 * This type represents the settings of a ReachFive account's stored in the backend.
 */
export type RemoteSettings = {
  sso: boolean
  pkceEnforced: boolean
  isPublic: boolean
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

export type Scope = string | string[]

export namespace ErrorResponse {
  export function isErrorResponse(thing: any): thing is ErrorResponse {
    return !!thing?.error
  }
}
