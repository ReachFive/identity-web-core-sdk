import { base64url } from 'jose'

import type { AuthOptions } from './authOptions'
import type { SignupProfileData } from '../api/models'

export const publicKeyCredentialType = 'public-key'

/**
 * Encodes credential bytes for the CIAM backend, which reads these fields with Java's
 * `Base64.getUrlDecoder` and so rejects `+` and `/` (see `webauthn/api/ByteList.scala`). base64url
 * is therefore required, not merely conventional. The WebAuthn API hands these fields over as
 * `ArrayBuffer`, whereas jose encodes byte arrays.
 */
const encodeBytes = (bytes: ArrayBuffer): string => base64url.encode(new Uint8Array(bytes))

/**
 * Decodes credential bytes coming from the backend, which writes them with
 * `Base64.getUrlEncoder` — padded for challenges and user ids, unpadded for credential descriptor
 * ids (see `webauthn/api/ByteList.scala`).
 *
 * Normalising before decoding keeps this tolerant of alphabet and padding as a deliberate property
 * of the SDK rather than of whichever base64 implementation happens to be installed: jose 5 accepts
 * the standard alphabet, jose 6 rejects it. Failing to decode a passkey challenge breaks
 * registration and login outright, and nothing in this repository can exercise that path, so the
 * tolerance is worth owning explicitly.
 */
const decodeBytes = (encoded: string): Uint8Array =>
  base64url.decode(encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''))

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
  EmailLoginWithWebAuthnParams | PhoneNumberLoginWithWebAuthnParams | DiscoverableLoginWithWebAuthnParams
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
  createdAt?: string
  lastUsedAt?: string
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
    transports: ReturnType<(typeof AuthenticatorAttestationResponse.prototype)['getTransports']>
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
    challenge: decodeBytes(serializedOptions.challenge),
    user: {
      ...serializedOptions.user,
      id: decodeBytes(serializedOptions.user.id)
    },
    excludeCredentials:
      serializedOptions.excludeCredentials &&
      serializedOptions.excludeCredentials!.map((excludeCredential) => ({
        ...excludeCredential,
        id: decodeBytes(excludeCredential.id)
      }))
  }
}

export function encodePublicKeyCredentialRequestOptions(
  serializedOptions: PublicKeyCredentialRequestOptionsSerialized
): PublicKeyCredentialRequestOptions {
  return {
    ...serializedOptions,
    challenge: decodeBytes(serializedOptions.challenge),
    allowCredentials: serializedOptions.allowCredentials.map((allowCrendential) => ({
      ...allowCrendential,
      id: decodeBytes(allowCrendential.id)
    }))
  }
}

export function serializeRegistrationPublicKeyCredential(
  encodedPublicKey: PublicKeyCredential
): RegistrationPublicKeyCredentialSerialized {
  const response = encodedPublicKey.response as AuthenticatorAttestationResponse

  return {
    id: encodedPublicKey.id,
    rawId: encodeBytes(encodedPublicKey.rawId),
    type: 'public-key',
    response: {
      clientDataJSON: encodeBytes(response.clientDataJSON),
      attestationObject: encodeBytes(response.attestationObject),
      transports: response.getTransports()
    }
  }
}

export function serializeAuthenticationPublicKeyCredential(
  encodedPublicKey: PublicKeyCredential
): AuthenticationPublicKeyCredentialSerialized {
  const response = encodedPublicKey.response as AuthenticatorAssertionResponse

  return {
    id: encodedPublicKey.id,
    rawId: encodeBytes(encodedPublicKey.rawId),
    type: 'public-key',
    response: {
      authenticatorData: encodeBytes(response.authenticatorData),
      clientDataJSON: encodeBytes(response.clientDataJSON),
      signature: encodeBytes(response.signature),
      userHandle: response.userHandle && encodeBytes(response.userHandle)
    }
  }
}
