import { Buffer } from 'buffer/'

import { encodeToBase64 } from '../utils/base64'

export const publicKeyCredentialType = 'public-key'

export type PublicKeyCredentialCreationOptionsSerialized = {
    rp: PublicKeyCredentialRpEntity
    user: {
        id: string
        displayName: string
        name: string
    }
    challenge: string
    pubKeyCredParams: PublicKeyCredentialParameters[]
    timeout?: number
    excludeCredentials?: PublicKeyCredentialDescriptor[]
    authenticatorSelection?: AuthenticatorSelectionCriteria
    attestation?: 'none'|  'indirect' | 'direct'
    extensions?: AuthenticationExtensionsClientInputs
}

export type PublicKeyCredentialSerialized = {
    id: string;
    type: 'public-key';
    response: {
        attestationObject: string
        clientDataJSON: string
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
        rp: {
            id: window.location.hostname,
            name: window.location.hostname
        }
    }
}

export function serializePublicKeyCredential(encodedPublicKey: PublicKeyCredential): PublicKeyCredentialSerialized {
    const response = encodedPublicKey.response as AuthenticatorAttestationResponse

    return {
        id: encodedPublicKey.id,
        type: encodedPublicKey.type,
        response: {
            clientDataJSON: encodeToBase64(response.clientDataJSON),
            attestationObject: encodeToBase64(response.attestationObject)
        }
    }
}
