/**
 * User profile as returned and accepted by the Identity API.
 */
import type { ConsentType } from './consents'

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
  total: number
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
  name: string
  minRequiredPages: number
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
  userId: string
  pageId: string
}

export type TokenRevocationRecord = {
  allLongLived?: string
  longLivedByClient: Record<string, string>
}

export type SuspensionStatus = 'temporary' | 'permanent'

export type SuspensionInformation = {
  status: SuspensionStatus
  reason?: string
}

export type ProviderInfos = {
  name: string
  id?: string
  email?: string
  firstLogin?: string
  lastLogin?: string
}

export type ProviderMetadata = {
  provider: string
  data: Record<string, unknown>
}
