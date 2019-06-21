import { encodeToBase64 } from "../utils/base64";

type PkceParams = { codeChallenge?: string, codeChallengeMethod?: string }

export type TokenRequestParameters = {
    code: string
    redirectUri: string
}

export function computePkceParams(pkceEnabled: boolean = false, verifierKey: string): Promise<PkceParams> {
    if (pkceEnabled) {
        console.log('PKCE enabled')
        const verifier = generateCodeVerifier()
        sessionStorage.setItem(verifierKey, verifier)
        return computeCodeChallenge(verifier)
            .then(challenge => {
                return {
                    codeChallenge: challenge,
                    codeChallengeMethod: 'S256'
                }
            })
    } else return Promise.resolve({})
}

function generateCodeVerifier(): string {
    const randomValues = window.crypto.getRandomValues(new Uint8Array(32))
    return  encodeToBase64(randomValues)
}

function computeCodeChallenge(verifier: string): Promise<string> {
    const binaryChallenge = Buffer.from(verifier,'utf-8');

    return new Promise(resolve => {
        window.crypto.subtle
            .digest('SHA-256', binaryChallenge)
            .then(hash => resolve(encodeToBase64(hash)))
    })
}