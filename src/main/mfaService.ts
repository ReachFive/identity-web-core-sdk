import { createHttpClient, HttpClient } from './httpClient'

export type StartPhoneNumberRegistrationParams = {
  accessToken: string
  phoneNumber: string
}

export type VerifyPhoneNumberRegistrationParams = {
  accessToken: string
  phoneNumber: string
  verificationCode: string
}

export default class MfaClient {
  constructor(domain: string) {
    const baseUrl = `https://${domain}/identity/v1/mfa/credentials/register/phone-number`
    this.http = createHttpClient({
      baseUrl
    })
    this.startPhoneNumberRegistrationUrl = `https://${baseUrl}/start`
    this.verifyPhoneNumberRegistrationUrl = `https://${baseUrl}/verify`
  }

  private http: HttpClient
  private readonly startPhoneNumberRegistrationUrl: string
  private readonly verifyPhoneNumberRegistrationUrl: string

  startPhoneNumberRegistration(params: StartPhoneNumberRegistrationParams): Promise<void> {
    const { accessToken, phoneNumber } = params
    return this.http.post<void>(this.startPhoneNumberRegistrationUrl, {
      body: {
        phoneNumber
      },
      accessToken
    })
  }

  verifyPhoneNumberRegistration(params: VerifyPhoneNumberRegistrationParams): Promise<void> {
    const { accessToken, phoneNumber, verificationCode } = params
    return this.http.post<void>(this.verifyPhoneNumberRegistrationUrl, {
      body: {
        phoneNumber,
        verificationCode
      },
      accessToken
    })
  }
}
