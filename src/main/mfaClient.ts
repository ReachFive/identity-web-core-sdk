import { MFA } from './models'
import { AuthOptions } from './authOptions'
import { HttpClient } from './httpClient'
import { AuthResult } from './authResult'
import EmailCredential = MFA.EmailCredential
import MfaCredentialsResponse = MFA.CredentialsResponse
import StepUpResponse = MFA.StepUpResponse

export type StartMfaEmailRegistrationParams = {
  accessToken: string
}

export type StartMfaEmailRegistrationResponse = { status: 'email_sent' } | { status: 'enabled', credential: EmailCredential }

export type VerifyMfaEmailRegistrationParams = {
  accessToken: string
  verificationCode: string
}

export type StartMfaPhoneNumberRegistrationParams = {
  accessToken: string
  phoneNumber: string
}

export type VerifyMfaPhoneNumberRegistrationParams = {
  accessToken: string
  verificationCode: string
}

export type VerifyMfaPasswordlessParams = {
  challengeId: string
  verificationCode: string
  accessToken: string
}

export type StepUpParams = {
  options?: AuthOptions
  accessToken?: string
}

export type RemoveMfaEmailParams = {
  accessToken: string
}

export type RemoveMfaPhoneNumberParams = {
  accessToken: string
  phoneNumber: string
}

/**
 * Identity Rest API Client
 */
export default class MfaClient {
  private http: HttpClient

  constructor(props: { http: HttpClient }) {
    this.http = props.http
  }

  startMfaEmailRegistration(params: StartMfaEmailRegistrationParams): Promise<StartMfaEmailRegistrationResponse> {
    const { accessToken } = params
    return this.http.post<StartMfaEmailRegistrationResponse>('/mfa/credentials/emails', {
      accessToken
    })
  }

  verifyMfaEmailRegistration(params: VerifyMfaEmailRegistrationParams): Promise<void> {
    const { accessToken, verificationCode } = params
    return this.http.post<void>('/mfa/credentials/emails/verify', {
      body: {
        verificationCode
      },
      accessToken
    })
  }

  startMfaPhoneNumberRegistration(params: StartMfaPhoneNumberRegistrationParams): Promise<void> {
    const { accessToken, phoneNumber } = params
    return this.http.post<void>('/mfa/credentials/phone-numbers', {
      body: {
        phoneNumber
      },
      accessToken
    })
  }

  verifyMfaPhoneNumberRegistration(params: VerifyMfaPhoneNumberRegistrationParams): Promise<void> {
    const { accessToken, verificationCode } = params
    return this.http.post<void>('/mfa/credentials/phone-numbers/verify', {
      body: {
        verificationCode
      },
      accessToken
    })
  }

  verifyMfaPasswordless(params: VerifyMfaPasswordlessParams): Promise<AuthResult> {
    const { challengeId, verificationCode, accessToken } = params

    return this.http.post<AuthResult>('/passwordless/verify', {
      body: {
        challengeId,
        verificationCode
      },
      accessToken
    })
  }

  getMfaStepUpToken(params: StepUpParams): Promise<StepUpResponse> {
    const authParams = this.authParams(params.options ?? {})
    return this.getPkceParams(authParams).then(challenge => {
      return this.http.post<StepUpResponse>('/mfa/stepup', {
        body: {
          ...authParams,
          ...challenge
        },
        withCookies: params.accessToken === undefined,
        accessToken: params.accessToken
      })
    })
  }

  listMfaCredentials(accessToken: string): Promise<MfaCredentialsResponse> {
    return this.http.get<MfaCredentialsResponse>('/mfa/credentials', {
      accessToken
    })
  }

  removeMfaEmail(params: RemoveMfaEmailParams): Promise<void> {
    const { accessToken } = params
    return this.http.remove<void>('/mfa/credentials/emails', {
      accessToken,
    })
  }

  removeMfaPhoneNumber(params: RemoveMfaPhoneNumberParams): Promise<void> {
    const { accessToken, phoneNumber } = params
    return this.http.remove<void>('/mfa/credentials/phone-numbers', {
      body: {
        phoneNumber
      },
      accessToken,
    })
  }
}
