import { Buffer } from 'buffer/'

import { AuthOptions } from './authOptions'
import { SignupProfileData } from './models'
import { encodeToBase64 } from '../utils/base64'

export const publicKeyCredentialType = 'public-key'

export type EmailLoginWithWebAuthnParams = { email: string }
export type PhoneNumberLoginWithWebAuthnParams = { phoneNumber: string }
/**
 * Launch discoverable login (= where the identifier and the passkey will be provided by the keychain)
 * @param conditionalMediation whether to use conditional mediation (= autofill request) or a modal request. <br />
 * If 'preferred' is selected, do conditional mediation only if the browser supports it and fallback to a modal request. <br />
 * If true is selected and conditional mediation is unavailable, an error will be returned
 */
export type DiscoverableLoginWithWebAuthnParams = { conditionalMediation: boolean | 'preferred' }
export type LoginWithWebAuthnParams = { auth?: AuthOptions; signal?: AbortSignal } & (
  | EmailLoginWithWebAuthnParams
  | PhoneNumberLoginWithWebAuthnParams
  | DiscoverableLoginWithWebAuthnParams
)

export type InternalLoginWithWebAuthnParams = LoginWithWebAuthnParams & { webAuthnOrigin?: string }

export type SignupWithWebAuthnParams = {
  profile: SignupProfileData
  friendlyName?: string
  redirectUrl?: string
  returnToAfterEmailConfirmation?: string
}

export type InternalSignupWithWebAuthnParams = SignupWithWebAuthnParams & { webAuthnOrigin?: string }

export type RegistrationOptions = {
  friendlyName: string
  options: {
    publicKey: PublicKeyCredentialCreationOptionsSerialized
  }
}
export type CredentialRequestOptionsSerialized = { publicKey: PublicKeyCredentialRequestOptionsSerialized }

export type DeviceCredential = {
  friendlyName: string
  id: string
  createdAt?: number
  lastUsedAt?: number
  aaguid?: string
}

type PublicKeyCredentialCreationOptionsSerialized = {
  rp: PublicKeyCredentialRpEntity
  user: {
    id: string
    displayName: string
    name: string
  }
  challenge: string
  pubKeyCredParams: PublicKeyCredentialParameters[]
  timeout?: number
  excludeCredentials?: {
    type: PublicKeyCredentialType
    id: string
    transports?: AuthenticatorTransport[]
  }[]
  authenticatorSelection?: AuthenticatorSelectionCriteria
  attestation?: AttestationConveyancePreference
  extensions?: AuthenticationExtensionsClientInputs
}

type PublicKeyCredentialRequestOptionsSerialized = {
  challenge: string
  timeout?: number
  rpId: string
  allowCredentials: {
    id: string
    transports?: AuthenticatorTransport[]
    type: PublicKeyCredentialType
  }[]
  userVerification: UserVerificationRequirement
}

export type RegistrationPublicKeyCredentialSerialized = {
  id: string
  rawId: string
  type: PublicKeyCredentialType
  response: {
    attestationObject: string
    clientDataJSON: string
  }
}

export type AuthenticationPublicKeyCredentialSerialized = {
  id: string
  rawId: string
  type: PublicKeyCredentialType
  response: {
    authenticatorData: string
    clientDataJSON: string
    signature: string
    userHandle: string | null
  }
}

export function encodePublicKeyCredentialCreationOptions(
  serializedOptions: PublicKeyCredentialCreationOptionsSerialized
): PublicKeyCredentialCreationOptions {
  return {
    ...serializedOptions,
    challenge: Buffer.from(serializedOptions.challenge, 'base64'),
    user: {
      ...serializedOptions.user,
      id: Buffer.from(serializedOptions.user.id, 'base64')
    },
    excludeCredentials:
      serializedOptions.excludeCredentials &&
      serializedOptions.excludeCredentials!.map((excludeCredential) => ({
        ...excludeCredential,
        id: Buffer.from(excludeCredential.id, 'base64')
      }))
  }
}

export function encodePublicKeyCredentialRequestOptions(
  serializedOptions: PublicKeyCredentialRequestOptionsSerialized
): PublicKeyCredentialRequestOptions {
  return {
    ...serializedOptions,
    challenge: Buffer.from(serializedOptions.challenge, 'base64'),
    allowCredentials: serializedOptions.allowCredentials.map((allowCrendential) => ({
      ...allowCrendential,
      id: Buffer.from(allowCrendential.id, 'base64')
    }))
  }
}

export function serializeRegistrationPublicKeyCredential(
  encodedPublicKey: PublicKeyCredential
): RegistrationPublicKeyCredentialSerialized {
  const response = encodedPublicKey.response as AuthenticatorAttestationResponse

  return {
    id: encodedPublicKey.id,
    rawId: encodeToBase64(encodedPublicKey.rawId),
    type: 'public-key',
    response: {
      clientDataJSON: encodeToBase64(response.clientDataJSON),
      attestationObject: encodeToBase64(response.attestationObject)
    }
  }
}

export function serializeAuthenticationPublicKeyCredential(
  encodedPublicKey: PublicKeyCredential
): AuthenticationPublicKeyCredentialSerialized {
  const response = encodedPublicKey.response as AuthenticatorAssertionResponse

  return {
    id: encodedPublicKey.id,
    rawId: encodeToBase64(encodedPublicKey.rawId),
    type: 'public-key',
    response: {
      authenticatorData: encodeToBase64(response.authenticatorData),
      clientDataJSON: encodeToBase64(response.clientDataJSON),
      signature: encodeToBase64(response.signature),
      userHandle: response.userHandle && encodeToBase64(response.userHandle)
    }
  }
}
