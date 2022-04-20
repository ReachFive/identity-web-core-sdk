import { HttpClient } from './httpClient'
import { IdentityEventManager } from './identityEventManager'
import { ApiClientConfig } from './main'
import { OpenIdUser, Profile } from './models'

export type UpdateEmailParams = { accessToken: string; email: string; redirectUrl?: string }

export type EmailVerificationParams = {
  accessToken: string
  redirectUrl?: string
  returnToAfterEmailConfirmation?: string
}

export type PhoneNumberVerificationParams = { accessToken: string }

type EmailRequestPasswordResetParams = {
  email: string
  redirectUrl?: string
  loginLink?: string
  returnToAfterPasswordReset?: string
  captchaToken?: string
}
type SmsRequestPasswordResetParams = {
  phoneNumber: string
  captchaToken?: string
}
export type RequestPasswordResetParams = EmailRequestPasswordResetParams | SmsRequestPasswordResetParams

type AccessTokenUpdatePasswordParams = {
  accessToken?: string
  password: string
  oldPassword?: string
  userId?: string
}
type EmailVerificationCodeUpdatePasswordParams = {
  accessToken?: string
  email: string
  verificationCode: string
  password: string
}
type SmsVerificationCodeUpdatePasswordParams = {
  accessToken?: string
  phoneNumber: string
  verificationCode: string
  password: string
}
export type UpdatePasswordParams =
  | AccessTokenUpdatePasswordParams
  | EmailVerificationCodeUpdatePasswordParams
  | SmsVerificationCodeUpdatePasswordParams

export type GetUserParams = {
  accessToken: string
  fields?: string
}

export type UnlinkParams = {
  accessToken: string
  identityId: string
  fields?: string
}

export type UpdatePhoneNumberParams = {
  accessToken: string
  phoneNumber: string
}

export type UpdateProfileParams = {
  accessToken: string
  redirectUrl?: string
  data: Profile
}

export type VerifyPhoneNumberParams = {
  accessToken: string
  phoneNumber: string
  verificationCode: string
}

/**
 * Identity Rest API Client
 */
export default class ProfileClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager

  private readonly sendEmailVerificationUrl: string
  private readonly sendPhoneNumberVerificationUrl: string
  private readonly signupDataUrl: string
  private readonly unlinkUrl: string
  private readonly updateEmailUrl: string
  private readonly updatePasswordUrl: string
  private readonly updatePhoneNumberUrl: string
  private updateProfileUrl: string
  private readonly userInfoUrl: string
  private verifyPhoneNumberUrl: string

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager

    this.sendEmailVerificationUrl = '/send-email-verification'
    this.sendPhoneNumberVerificationUrl = '/send-phone-number-verification'
    this.signupDataUrl = '/signup/data'
    this.unlinkUrl = '/unlink'
    this.updateEmailUrl = '/update-email'
    this.updatePasswordUrl = '/update-password'
    this.updatePhoneNumberUrl = '/update-phone-number'
    this.updateProfileUrl = '/update-profile'
    this.userInfoUrl = '/userinfo'
    this.verifyPhoneNumberUrl = '/verify-phone-number'
  }

  getSignupData(signupToken: string): Promise<OpenIdUser> {
    return this.http.get<OpenIdUser>(this.signupDataUrl, {
      query: {
        clientId: this.config.clientId,
        token: signupToken,
      },
    })
  }

  getUser(params: GetUserParams): Promise<Profile> {
    const { accessToken, fields } = params
    return this.http.get<Profile>(this.userInfoUrl, { query: { fields }, accessToken })
  }

  requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
    return this.http.post('/forgot-password', {
      body: {
        clientId: this.config.clientId,
        ...params,
      },
    })
  }

  sendEmailVerification(params: EmailVerificationParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post(this.sendEmailVerificationUrl, { body: { ...data }, accessToken })
  }

  sendPhoneNumberVerification(params: PhoneNumberVerificationParams): Promise<void> {
    const { accessToken } = params
    return this.http.post(this.sendPhoneNumberVerificationUrl, { accessToken })
  }

  unlink(params: UnlinkParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post(this.unlinkUrl, { body: data, accessToken })
  }

  updateEmail(params: UpdateEmailParams): Promise<void> {
    const { accessToken, email, redirectUrl } = params
    return this.http.post(this.updateEmailUrl, { body: { email, redirectUrl }, accessToken })
  }

  updatePhoneNumber(params: UpdatePhoneNumberParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post(this.updatePhoneNumberUrl, { body: data, accessToken })
  }

  updateProfile(params: UpdateProfileParams): Promise<void> {
    const { accessToken, redirectUrl, data } = params
    return this.http
      .post(this.updateProfileUrl, { body: { ...data, redirectUrl }, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', data))
  }

  updatePassword(params: UpdatePasswordParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post(this.updatePasswordUrl, {
      body: { clientId: this.config.clientId, ...data },
      accessToken,
    })
  }

  verifyPhoneNumber(params: VerifyPhoneNumberParams): Promise<void> {
    const { accessToken, ...data } = params
    const { phoneNumber } = data
    return this.http
      .post(this.verifyPhoneNumberUrl, { body: data, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', { phoneNumber, phoneNumberVerified: true }))
  }
}
