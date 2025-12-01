// TODO: To sort
export type Profile = {
  uid?: string
  signedUid?: string
  givenName?: string
  middleName?: string
  familyName?: string
  name?: string
  nickname?: string
  birthdate?: string
  birthDate?: number
  birthDay?: number
  birthMonth?: number
  birthYear?: number
  profileURL?: string
  picture?: string
  externalId?: string
  identities?: Identity[]
  authTypes: string[]
  loginSummary?: LoginSummary
  username?: string
  email?: string
  emailVerified?: boolean
  emails: Emails
  gender?: string
  addresses?: ProfileAddress[]
  city?: string
  country?: string
  phoneNumber?: string
  phoneNumberVerified?: boolean
  likes?: Like[]
  educationLevel?: string
  bio?: string
  relationshipStatus?: string
  hometown?: string
  professionalHeadline?: string
  professionalIndustry?: string
  company?: string
  friends?: Friend[]
  locale?: string
  followersCount?: number
  friendsCount?: number
  likesCount?: number
  customFields?: CustomFieldsValues
  // audiences?: Segment[]
  interests?: Interest[]
  // signins?: UserEvent[]
  consents?: UserConsents
  thirdPartyGrants: ThirdPartyGrant[]
  facebookIdsForPages?: FacebookIdForPage[]
  createdAt?: number
  nameAlias?: string
  givenNameAlias?: string
  familyNameAlias?: string
  updatedAt?: number
  liteOnly?: boolean
  tokenRevocationRecord: TokenRevocationRecord
  lockoutEndDate?: number
  suspended?: boolean
  suspensionStatus?: SuspensionStatus
  suspensionInformation?: SuspensionInformation
  customIdentifier?: string
  id?: string
  sub?: string
  age?: number
  profile?: string
  providers: string[]
  likesFriendsRatio: number
  localFriendsCount: number
  firstLogin?: number
  lastLogin?: number
  loginsCount: number
  origins: string[]
  devices: string[]
  lastLoginType?: string
  lastLoginProvider?: string
  hasPassword: boolean
  socialIdentities: Identity[]
  hasManagedProfile: boolean
  providerMetadata?: ProviderMetadata[]
  // Legacy fields
  firstName?: string
  lastName?: string
  fullName?: string
  photoURL?: string
  providerDetails: ProviderInfos[]
}

export type Identity = {
  provider: string
  providerVariant?: string
  userId?: string
  username?: string
  createdAt?: string
  updatedAt?: string
  id?: string
}

export type LoginSummary = {
  firstLogin?: number
  lastLogin?: number
  total: number,
  origins: string[]
  devices: string[]
  lastProvider?: string
}

export type Emails = {
  verified: string[]
  unverified: string[]
}

export type ProfileAddress = {
  title?: string
  isDefault?: boolean
  addressType?: 'billing' | 'delivery'
  streetAddress?: string
  addressComplement?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
  raw?: string
  deliveryNote?: string
  recipient?: string
  company?: string
  phoneNumber?: string
  customFields?: Record<string, unknown>
}

export type Like = {
  id?: number
  name?: string
  category?: string
  created?: string
}

export type Friend = {
  uid?: string
  givenName?: string
  familyName?: string
  name?: string
  gender?: string
}

export type CustomFieldsValues = Record<string, unknown>

export type Interest = {
  id?: string
  name: string,
  minRequiredPages: number,
  description?: string
  facebookPageIds: string[]
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  timestamp?: string
}

export type UserConsentVersion = {
  language: string
  versionId: number
}

export type UserConsent = {
  granted: boolean
  waitingDoubleAccept?: boolean
  date: string
  consentVersion?: UserConsentVersion
  consentType?: ConsentType
  reporter?: string
}

export type UserConsents = Record<string, UserConsent>

export type ThirdPartyGrant = {
  clientId: string
  date: string
  scope: string
}

export type FacebookIdForPage = {
  userId: string,
  pageId: string
}

export type TokenRevocationRecord = {
  allLongLived?: string
  longLivedByClient: Record<string, string>
}

export type SuspensionStatus = 'temporary' | 'permanent'

export type SuspensionInformation = {
  status: SuspensionStatus,
  reason?: string
}

export type ProviderInfos = {
  name: string,
  id?: string
  email?: string
  firstLogin?: string
  lastLogin?: string
}

export type ProviderMetadata = {
  provider: string
  data: Record<string, unknown>
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
  customFields?: Record<string, unknown>
  consents?: Record<string, unknown>
  company?: string
  liteOnly?: boolean
  customIdentifier?: string
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
  customFields?: Record<string, unknown>
}

export type SessionInfo = {
  isAuthenticated: true
  name?: string
  email?: string
  lastLoginType?: string
  hasPassword?: boolean
  socialProviders?: string[]
}

export type OrchestrationToken = string

export type AuthenticationToken = { tkn?: string, mfaRequired?: boolean }

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

  export type CredentialType = Credential['type']

  export type Credential = PhoneCredential | EmailCredential

  export type PhoneCredential = {
    type: 'sms'
    phoneNumber: string
    createdAt: string
    friendlyName: string
  }

  export type EmailCredential = {
    type: 'email'
    email: string
    createdAt: string
    friendlyName: string
  }

  export type CredentialsResponse = {
    credentials: Credential[]
  }

  export type StepUpResponse = {
    amr: string[]
    token: string
  }
}

export type TrustedDevice = {
  id: string
  metadata: TrustedDeviceMetadata
  userId: string
  createdAt: string
}

export type TrustedDeviceMetadata = {
  ip?: string
  operatingSystem?: string
  userAgent?: string
  deviceClass?: string
  deviceName?: string
}

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4

export interface PasswordStrength {
    score: PasswordStrengthScore
}

export type PasswordPolicy = {
  minLength: number
  minStrength: PasswordStrengthScore
  uppercaseCharacters?: number
  specialCharacters?: number
  lowercaseCharacters?: number
  digitCharacters?: number
  allowUpdateWithAccessTokenOnly: boolean
}

export type CustomFieldType = 'number' | 'integer' | 'decimal' | 'string' | 'date' | 'checkbox' | 'select' | 'tags' | 'object' | 'phone' | 'email'

export type LabelTranslation = {
  langCode: string
  label: string
}

export type SelectableValue = {
  value: string,
  label: string,
  translations: LabelTranslation[]
}

export type CustomField = {
  id?: string,
  name: string,
  nameTranslations?: LabelTranslation[]
  path: string,
  dataType: CustomFieldType,
  selectableValues?: SelectableValue[]
  scope?: string
  readScope?: string
}

export type ConsentType = 'double-opt-in' | 'opt-in' | 'opt-out'

export type ConsentStatus = 'active' | 'archived'

export type ConsentVersion = {
  versionId: number
  title: string
  description?: string
  language: string
}

export type ConsentVersions = {
  key: string,
  versions: ConsentVersion[],
  consentType: ConsentType,
  status: ConsentStatus
}

export type Consent = {
  key: string
  title: string
  description?: string
  consentType: ConsentType
  status: ConsentStatus
}

export type SessionDevice = {
  id: string,
  ip?: string,
  operatingSystem?: string,
  userAgentName?: string,
  deviceClass?: string,
  deviceName?: string,
  firstConnection: string,
  lastConnection: string
}

export type SessionDeviceListResponse = {
  sessionDevices: SessionDevice[]
}
/**
 * This type represents the settings of a ReachFive account's stored in the backend.
 */
export type RemoteSettings = {
  sso: boolean
  sms: boolean
  webAuthn: boolean
  language: string
  countryCode?: string
  pkceEnforced: boolean
  isPublic: boolean
  scope?: string
  socialProviders: string[]
  googleClientId?: string,
  passwordPolicy: PasswordPolicy,
  consents?: Consent[],
  customFields: CustomField[],
  resourceBaseUrl: string,
  mfaSmsEnabled: boolean,
  mfaEmailEnabled: boolean,
  rbaEnabled: boolean,
  isImplicitFlowForbidden: boolean
}

export type ErrorResponse = {
  error: string
  errorDescription?: string
  errorUserMsg?: string
  errorDetails?: FieldError[]
  errorMessageKey?: string
}

export type FieldError = {
  field: string
  message: string
  code: 'missing' | 'invalid'
}

export type Scope = string | string[]

export namespace ErrorResponse {
  export function isErrorResponse(thing: unknown): thing is ErrorResponse {
    return typeof thing === 'object' && thing !== null && 'error' in thing
  }
}
