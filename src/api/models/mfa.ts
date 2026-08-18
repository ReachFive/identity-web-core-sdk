/**
 * Multi-factor authentication credentials, challenges and trusted devices.
 */
export type PasswordlessResponse = MFA.ChallengeId

// Public API: consumers reference `MFA.CredentialsResponse`, `MFA.isPhoneCredential`, and so on.
// Note that `MFA.Credential` shadows the DOM `Credential` type inside this namespace, which is a
// wart worth revisiting whenever a major version allows renaming these.
// eslint-disable-next-line @typescript-eslint/no-namespace
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
