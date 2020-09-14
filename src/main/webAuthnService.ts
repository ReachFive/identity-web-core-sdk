import { Buffer } from 'buffer/'

import { AuthOptions } from './authOptions'
import { SignupProfileData } from './models'
import { encodeToBase64 } from '../utils/base64'

export const publicKeyCredentialType = 'public-key'

export type EmailLoginWithWebAuthnParams = { email: string, auth?: AuthOptions }
export type PhoneNumberLoginWithWebAuthnParams = { phoneNumber: string, auth?: AuthOptions  }
export type LoginWithWebAuthnParams =  EmailLoginWithWebAuthnParams | PhoneNumberLoginWithWebAuthnParams

export type SignupWithWebAuthnParams = {
    profile: SignupProfileData
    friendlyName?: string,
    redirectUrl?: string
}

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
        type: "public-key"
        id: string
        transports?: Array<"usb" | "nfc" | "ble" | "internal">
    }[]
    authenticatorSelection?: AuthenticatorSelectionCriteria
    attestation?: 'none'|  'indirect' | 'direct'
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
    userVerification: 'required' | 'preferred' | 'discouraged'
}

export type RegistrationPublicKeyCredentialSerialized = {
    id: string
    rawId: string
    type: 'public-key'
    response: {
        attestationObject: string
        clientDataJSON: string
    }
}

export type AuthenticationPublicKeyCredentialSerialized = {
    id: string
    rawId: string
    type: 'public-key'
    response: {
        authenticatorData: string
        clientDataJSON: string
        signature: string
        userHandle: string | null
    }
}

export function encodePublicKeyCredentialCreationOptions(serializedOptions: PublicKeyCredentialCreationOptionsSerialized): PublicKeyCredentialCreationOptions {
    return {
        ...serializedOptions,
        challenge: Buffer.from(serializedOptions.challenge, 'base64'),
        user: {
            ...serializedOptions.user,
            id:  Buffer.from(serializedOptions.user.id, 'base64')
        },
        excludeCredentials: serializedOptions.excludeCredentials && serializedOptions.excludeCredentials!.map(excludeCredential => ({
            ...excludeCredential,
            id: Buffer.from(excludeCredential.id, 'base64')
        }))
    }
}

export function encodePublicKeyCredentialRequestOptions(serializedOptions: PublicKeyCredentialRequestOptionsSerialized): PublicKeyCredentialRequestOptions {
    return {
        ...serializedOptions,
        challenge: Buffer.from(serializedOptions.challenge, 'base64'),
        allowCredentials: serializedOptions.allowCredentials.map(allowCrendential => ({
            ...allowCrendential,
            id: Buffer.from(allowCrendential.id, 'base64')
        }))
    }
}

export function serializeRegistrationPublicKeyCredential(encodedPublicKey: PublicKeyCredential): RegistrationPublicKeyCredentialSerialized {
    const response = encodedPublicKey.response as AuthenticatorAttestationResponse

    return {
        id: encodedPublicKey.id,
        rawId: encodeToBase64(encodedPublicKey.rawId),
        type: encodedPublicKey.type,
        response: {
            clientDataJSON: encodeToBase64(response.clientDataJSON),
            attestationObject: encodeToBase64(response.attestationObject)
        }
    }
}

export function serializeAuthenticationPublicKeyCredential(encodedPublicKey: PublicKeyCredential): AuthenticationPublicKeyCredentialSerialized {
    const response = encodedPublicKey.response as AuthenticatorAssertionResponse

    return {
        id: encodedPublicKey.id,
        rawId: encodeToBase64(encodedPublicKey.rawId),
        type: encodedPublicKey.type,
        response: {
            authenticatorData: encodeToBase64(response.authenticatorData),
            clientDataJSON: encodeToBase64(response.clientDataJSON),
            signature: encodeToBase64(response.signature),
            userHandle: response.userHandle && encodeToBase64(response.userHandle)
        }
    }
}
