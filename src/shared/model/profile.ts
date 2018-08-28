
type CustomFields = {
  [key: string]: string | number | boolean | string[]
}

type Consents = {
  [key: string]: {
    granted: boolean
    consentType: 'opt-in' | 'opt-out'
    date: string
  }
}

type Identity = {
  provider: string
  username?: string
  createdAt?: string
  updatedAt?: string
}

export type Profile = {
  email?: string
  password?: string
  gender?: string
  givenName?: string
  familyName?: string
  birthDate?: string
  company?: string
  address?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  customFields?: CustomFields
  consents?: Consents
  socialIdentities?: Identity[]
}