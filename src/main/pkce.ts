import * as base64 from 'base64-js'

const HAS_CRYPTO = typeof window !== 'undefined' && !!window.crypto
const HAS_SUBTLE_CRYPTO = HAS_CRYPTO && !!window.crypto.subtle
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export interface PkceCode {
    codeVerifier: string
    codeChallenge: string
    codeChallengeMethod: CodeChallengeMethod
}

export type CodeChallengeMethod = 'S256'

export function generatePkceCode(size: number = 100): Promise<PkceCode> {
    const codeVerifierBuffer = generateCodeVerifierBuffer(size)
    return generateCodeChallenge(codeVerifierBuffer).then<PkceCode>(codeChallenge => {
        return {
            codeVerifier: bufferToString(codeVerifierBuffer),
            codeChallenge,
            codeChallengeMethod: 'S256'
        }
    })
}


function bufferToString(buffer: Uint8Array): string {
    const array = []
    for (let i = 0; i < buffer.byteLength; i += 1) {
        array.push(CHARSET[i])
    }
    return array.join('')
}

function base64UrlSafe(buffer: Uint8Array): string {
    return base64
        .fromByteArray(new Uint8Array(buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}

function generateCodeVerifierBuffer(size: number = 100): Uint8Array {
    const buffer = new Uint8Array(size)
    if (HAS_CRYPTO) {
        window.crypto.getRandomValues(buffer)
    } else {
        for (let i = 0; i < size; i += 1) {
            buffer[i] = Math.random() % CHARSET.length
        }
    }
    return buffer
}

function generateCodeChallenge(codeVerifierBuffer: Uint8Array): Promise<string> {
    return generateCodeChallengeBuffer(codeVerifierBuffer).then(base64UrlSafe)
}

function generateCodeChallengeBuffer(codeVerifierBuffer: Uint8Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        if (codeVerifierBuffer.byteLength < 43 || codeVerifierBuffer.byteLength > 128) {
            Promise.reject(new Error("codeVerifier should be minimum 43 and maximum 128"))
        }
        // TODO fallback to lib
        if (!HAS_SUBTLE_CRYPTO) {
            return Promise.reject(new Error('window.crypto.subtle is unavailable.'))
        }
        return crypto.subtle.digest('SHA-256', codeVerifierBuffer)
            .then(buffer => resolve(new Uint8Array(buffer)), reject)
    })
}
