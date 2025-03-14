import {MFA, TrustedDevice} from './models'
import { AuthOptions } from './authOptions'
import { HttpClient } from './httpClient'
import { AuthResult } from './authResult'
import OAuthClient from './oAuthClient'
import CredentialsResponse = MFA.CredentialsResponse
import EmailCredential = MFA.EmailCredential
import StepUpResponse = MFA.StepUpResponse
import PhoneCredential = MFA.PhoneCredential

export type RemoveMfaEmailParams = {
  accessToken: string
}

export type RemoveMfaPhoneNumberParams = {
  accessToken: string
  phoneNumber: string
}

export type StartMfaEmailRegistrationParams = {
  accessToken: string
  trustDevice?: boolean
}

export type StartMfaEmailRegistrationResponse = { status: 'email_sent' } | { status: 'enabled', credential: EmailCredential }

export type StartMfaPhoneNumberRegistrationParams = {
  accessToken: string
  phoneNumber: string
  trustDevice?: boolean
}

export type StartMfaPhoneNumberRegistrationResponse = { status: 'sms_sent' } | { status: 'enabled', credential: PhoneCredential }

export type StepUpParams = {
  options?: AuthOptions
  accessToken?: string
  tkn?: string
}

export type VerifyMfaEmailRegistrationParams = {
  accessToken: string
  verificationCode: string
  trustDevice?: boolean
}

export type VerifyMfaPasswordlessParams = {
  challengeId: string
  verificationCode: string
  trustDevice?: boolean
}

export type VerifyMfaPhoneNumberRegistrationParams = {
  accessToken: string
  verificationCode: string
  trustDevice?: boolean
}

export type DeleteTrustedDeviceParams = {
  accessToken: string
  trustedDeviceId: string
}
export type ListTrustedDevicesResponse = {
  trustedDevices: TrustedDevice[]
}

/**
 * Identity Rest API Client
 */
export default class MfaClient {
  private http: HttpClient
  private oAuthClient: OAuthClient

  private credentialsUrl: string
  private emailCredentialUrl: string
  private emailCredentialVerifyUrl: string
  private passwordlessVerifyUrl: string
  private phoneNumberCredentialUrl: string
  private phoneNumberCredentialVerifyUrl: string
  private stepUpUrl: string
  private trustedDeviceUrl: string

  constructor(props: { http: HttpClient; oAuthClient: OAuthClient }) {
    this.http = props.http
    this.oAuthClient = props.oAuthClient

    this.credentialsUrl = '/mfa/credentials'
    this.emailCredentialUrl = `${this.credentialsUrl}/emails`
    this.emailCredentialVerifyUrl = `${this.emailCredentialUrl}/verify`
    this.passwordlessVerifyUrl = '/passwordless/verify'
    this.phoneNumberCredentialUrl = `${this.credentialsUrl}/phone-numbers`
    this.phoneNumberCredentialVerifyUrl = `${this.phoneNumberCredentialUrl}/verify`
    this.stepUpUrl = '/mfa/stepup'
    this.trustedDeviceUrl = '/mfa/trusteddevices'
  }

  getMfaStepUpToken(params: StepUpParams): Promise<StepUpResponse> {
    const authParams = this.oAuthClient.authParams(params.options ?? {})
    return this.oAuthClient.getPkceParams(authParams).then(challenge => {
      return this.http.post<StepUpResponse>(this.stepUpUrl, {
        body: {
          ...authParams,
          tkn: params.tkn,
          ...challenge
        },
        withCookies: params.accessToken === undefined,
        accessToken: params.accessToken
      })
    })
  }

  listMfaCredentials(accessToken: string): Promise<CredentialsResponse> {
    return this.http.get<CredentialsResponse>(this.credentialsUrl, {
      accessToken
    })
  }

  removeMfaEmail(params: RemoveMfaEmailParams): Promise<void> {
    const { accessToken } = params
    return this.http.remove<void>(this.emailCredentialUrl, {
      accessToken,
    })
  }

  removeMfaPhoneNumber(params: RemoveMfaPhoneNumberParams): Promise<void> {
    const { accessToken, phoneNumber } = params
    return this.http.remove<void>(this.phoneNumberCredentialUrl, {
      body: {
        phoneNumber
      },
      accessToken,
    })
  }

  startMfaEmailRegistration(params: StartMfaEmailRegistrationParams): Promise<StartMfaEmailRegistrationResponse> {
    const { accessToken, trustDevice = false } = params
    return this.http.post<StartMfaEmailRegistrationResponse>(this.emailCredentialUrl, {
      body: {
      trustDevice
    },
      accessToken,
    })
  }

  startMfaPhoneNumberRegistration(params: StartMfaPhoneNumberRegistrationParams): Promise<StartMfaPhoneNumberRegistrationResponse> {
    const { accessToken, phoneNumber, trustDevice = false } = params
    return this.http.post<StartMfaPhoneNumberRegistrationResponse>(this.phoneNumberCredentialUrl, {
      body: {
        phoneNumber,
        trustDevice
      },
      accessToken
    })
  }

  verifyMfaEmailRegistration(params: VerifyMfaEmailRegistrationParams): Promise<void> {
    const { accessToken, verificationCode, trustDevice = false } = params
    return this.http.post<void>(this.emailCredentialVerifyUrl, {
      body: {
        verificationCode,
        trustDevice
      },
      accessToken
    })
  }

  verifyMfaPasswordless(params: VerifyMfaPasswordlessParams): Promise<AuthResult> {
    const { challengeId, verificationCode, trustDevice} = params

    return this.http.post<AuthResult>(this.passwordlessVerifyUrl, {
      body: {
        challengeId,
        verificationCode,
        trustDevice
      },
      withCookies: true,
    })
  }

  verifyMfaPhoneNumberRegistration(params: VerifyMfaPhoneNumberRegistrationParams): Promise<void> {
    const { accessToken, verificationCode, trustDevice } = params
    return this.http.post<void>(this.phoneNumberCredentialVerifyUrl, {
      body: {
        verificationCode,
        trustDevice
      },
      accessToken
    })
  }

  listTrustedDevices(accessToken: string): Promise<ListTrustedDevicesResponse> {
    return this.http.get<ListTrustedDevicesResponse>(this.trustedDeviceUrl, {
      accessToken
    })
  }

  deleteTrustedDevices(params: DeleteTrustedDeviceParams): Promise<void> {
    const { accessToken, trustedDeviceId } = params
    return this.http.remove<void>(this.trustedDeviceUrl + '/' + trustedDeviceId, {accessToken})
  }
}
