/**
 * User profile as returned and accepted by the Identity API.
 */
import type { ConsentType } from './consents'

/**
 * A profile as the API returns it.
 *
 * Fields come and go with the request. Most require an OAuth scope, noted on each: a field the access
 * token's scopes do not cover is absent, not empty. And when `fields` is passed, only the fields it lists are
 * returned — including the ones typed as always present, which are only guaranteed without `fields`.
 */
export type Profile = {
  uid?: string
  /** @deprecated Never returned by the API. */
  signedUid?: string
  /** Requires the `profile` scope. */
  givenName?: string
  /** Requires the `profile` scope. */
  middleName?: string
  /** Requires the `profile` scope. */
  familyName?: string
  /** Requires the `profile` scope. */
  name?: string
  /** Requires the `profile` scope. */
  nickname?: string
  /** `YYYY-MM-DD`. Requires the `profile` scope. */
  birthdate?: string
  /** ISO 8601 date-time. Requires the `profile` scope. */
  birthDate?: string
  /** Requires the `profile` scope. */
  birthDay?: number
  /** Requires the `profile` scope. */
  birthMonth?: number
  /** Requires the `profile` scope. */
  birthYear?: number
  /** Requires the `profile` scope. */
  profileUrl?: string
  /** @deprecated Never populated: the API's `profile_url` arrives as `profileUrl`. */
  profileURL?: string
  /** Requires the `profile` scope. */
  picture?: string
  externalId?: string
  identities?: Identity[]
  authTypes: string[]
  loginSummary?: LoginSummary
  /** Requires the `profile` scope. */
  username?: string
  /** Requires the `email` scope. */
  email?: string
  /** Requires the `email` scope. */
  emailVerified?: boolean
  /** Requires the `email` scope. */
  emails?: Emails
  /** Requires the `profile` scope. */
  gender?: string
  /** Requires the `address` scope. */
  addresses?: ProfileAddress[]
  /** Requires the `address` scope. */
  city?: string
  /** Requires the `address` scope. */
  country?: string
  /** Requires the `phone` scope. */
  phoneNumber?: string
  /** Requires the `phone` scope. */
  phoneNumberVerified?: boolean
  /** @deprecated Never returned by the API. */
  likes?: Like[]
  /** Requires the `profile` scope. */
  educationLevel?: string
  /** Requires the `profile` scope. */
  bio?: string
  /** Requires the `profile` scope. */
  relationshipStatus?: string
  /** Requires the `address` scope. */
  hometown?: string
  /** Requires the `profile` scope. */
  professionalHeadline?: string
  /** Requires the `profile` scope. */
  professionalIndustry?: string
  /** Requires the `profile` scope. */
  company?: string
  /** @deprecated Never returned by the API. */
  friends?: Friend[]
  /** Requires the `profile` scope. */
  locale?: string
  /** @deprecated Never returned by the API. */
  followersCount?: number
  /** @deprecated Never returned by the API. */
  friendsCount?: number
  /** @deprecated Never returned by the API. */
  likesCount?: number
  /** Only the custom fields whose read scope the access token carries. Values are returned as stored. */
  customFields?: CustomFieldsValues
  /** @deprecated Never returned by the API. */
  interests?: Interest[]
  /** Keyed by consent key. */
  consents?: UserConsents
  thirdPartyGrants: ThirdPartyGrant[]
  /** @deprecated Never returned by the API. */
  facebookIdsForPages?: FacebookIdForPage[]
  /** ISO 8601 date-time. Requires the `profile` scope. */
  createdAt?: string
  /** Requires the `profile` scope. */
  nameAlias?: string
  /** Requires the `profile` scope. */
  givenNameAlias?: string
  /** Requires the `profile` scope. */
  familyNameAlias?: string
  /** ISO 8601 date-time. Requires the `profile` scope. */
  updatedAt?: string
  liteOnly?: boolean
  tokenRevocationRecord: TokenRevocationRecord
  /** ISO 8601 date-time. */
  lockoutEndDate?: string
  suspended?: boolean
  suspensionStatus?: SuspensionStatus
  suspensionInformation?: SuspensionInformation
  /** Requires the `profile` scope. */
  customIdentifier?: string
  /** Requires the `profile` scope. */
  synchronizationId?: string
  id?: string
  sub?: string
  /** Requires the `profile` scope. */
  age?: number
  profile?: string
  providers: string[]
  /** @deprecated Never returned by the API. */
  likesFriendsRatio?: number
  /** @deprecated Never returned by the API. */
  localFriendsCount?: number
  /** ISO 8601 date-time. */
  firstLogin?: string
  /** ISO 8601 date-time. */
  lastLogin?: string
  loginsCount: number
  origins: string[]
  devices: string[]
  lastLoginType?: string
  lastLoginProvider?: string
  hasPassword: boolean
  socialIdentities: Identity[]
  hasManagedProfile: boolean
  /** Requires the `profile` scope. */
  providerMetadata?: ProviderMetadata
  /** Requires a permission to read leaked credentials. */
  hasLeakedCredentials?: boolean
  // Legacy fields
  /** Requires the `profile` scope. */
  firstName?: string
  /** Requires the `profile` scope. */
  lastName?: string
  /** Requires the `profile` scope. */
  fullName?: string
  /** Requires the `profile` scope. */
  photoUrl?: string
  /** @deprecated Never populated: the API's `photo_url` arrives as `photoUrl`. */
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
  /** Position of the address in the profile's list. Set by the API. */
  id?: number
  title?: string
  /** Whether this is the profile's default address. */
  default?: boolean
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
  /** @deprecated Never returned by the API: read `Profile.suspensionStatus` instead. */
  status?: SuspensionStatus
  reason?: string
}

export type ProviderInfos = {
  name: string
  id?: string
  email?: string
  firstLogin?: string
  lastLogin?: string
}

/**
 * Data from the providers the user logged in with, keyed by provider name. Only the providers below attach
 * metadata, and only for users who logged in with them.
 */
export type ProviderMetadata = {
  bconnect?: { cico?: string }
  kakaotalk?: { ci?: string; ciAuthenticatedAt?: string; kakaotalkAgeRange?: string }
  naver?: { naverAgeRange: string; ci?: string }
  wechat?: { unionId: string }
  tiktok?: { openId: string }
  line?: { givenNamePronunciation?: string; familyNamePronunciation?: string }
}

/** What `sendEmailVerification` resolves with. */
export type EmailVerificationResponse = {
  verificationEmailSent: boolean
}

/** What `sendPhoneNumberVerification` resolves with. */
export type PhoneNumberVerificationResponse = {
  verificationCodeSent: boolean
}
