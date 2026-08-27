/**
 * Account-defined consents and their versions.
 */
export type ConsentType = 'double-opt-in' | 'opt-in' | 'opt-out'

export type ConsentStatus = 'active' | 'archived'

export type ConsentVersion = {
  versionId: number
  title: string
  description?: string
  language: string
}

export type ConsentVersions = {
  key: string
  versions: ConsentVersion[]
  consentType: ConsentType
  status: ConsentStatus
}

export type Consent = {
  key: string
  title: string
  description?: string
  consentType: ConsentType
  status: ConsentStatus
}
