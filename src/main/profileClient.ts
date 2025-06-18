import {
  Profile,
  OpenIdUser,
} from './models'
import { IdentityEventManager } from './identityEventManager'
import { HttpClient } from './httpClient'
import { ApiClientConfig } from './main'

export type UpdateEmailParams = { accessToken: string; email: string; redirectUrl?: string; captchaToken?: string, captchaFoxToken?: string }

export type EmailVerificationParams = { accessToken: string; redirectUrl?: string; returnToAfterEmailConfirmation?: string }

export type PhoneNumberVerificationParams = { accessToken: string }

type EmailRequestPasswordResetParams = {
  email: string
  redirectUrl?: string
  loginLink?: string
  returnToAfterPasswordReset?: string
  captchaToken?: string
  captchaFoxToken?: string
}
type SmsRequestPasswordResetParams = {
  phoneNumber: string
  captchaToken?: string
  captchaFoxToken?: string
}
export type RequestPasswordResetParams = EmailRequestPasswordResetParams | SmsRequestPasswordResetParams

type EmailRequestAccountRecoveryParams = {
  email: string
  redirectUrl?: string
  loginLink?: string
  returnToAfterAccountRecovery?: string
  captchaToken?: string
  captchaFoxToken?: string
}
type SmsRequestAccountRecoveryParams = {
  phoneNumber: string
  captchaToken?: string
  captchaFoxToken?: string
}
export type RequestAccountRecoveryParams = EmailRequestAccountRecoveryParams | SmsRequestAccountRecoveryParams

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
}

export type UpdatePhoneNumberParams = {
  accessToken: string
  phoneNumber: string
}

export type UpdateProfileParams = {
  accessToken: string
  redirectUrl?: string
  data: Partial<Profile>
}

export type VerifyPhoneNumberParams = {
  accessToken: string
  phoneNumber: string
  verificationCode: string
}

export type VerifyEmailParams = {
  email: string
  verificationCode: string
  accessToken: string
}

/**
 * Identity Rest API Client
 */
export default class ProfileClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager

  private sendEmailVerificationUrl: string
  private sendPhoneNumberVerificationUrl: string
  private signupDataUrl: string
  private unlinkUrl: string
  private updateEmailUrl: string
  private updatePasswordUrl: string
  private updatePhoneNumberUrl: string
  private updateProfileUrl: string
  private userInfoUrl: string
  private verifyPhoneNumberUrl: string
  private verifyEmailUrl: string

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
    this.verifyEmailUrl = '/verify-email'
  }

  getSignupData(signupToken: string): Promise<OpenIdUser> {
    return this.http.get<OpenIdUser>(this.signupDataUrl, {
      query: {
        clientId: this.config.clientId,
        token: signupToken
      }
    })
  }

  getUser(params: GetUserParams): Promise<Profile> {
    const { accessToken, fields } = params
    return this.http.get<Profile>(this.userInfoUrl, { query: { fields }, accessToken })
  }

  requestAccountRecovery(params: RequestAccountRecoveryParams): Promise<void> {
    return this.http.post('/account-recovery', {
      body: {
        clientId: this.config.clientId,
        ...params
      }
    })
  }

  requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
    return this.http.post('/forgot-password', {
      body: {
        clientId: this.config.clientId,
        ...params
      }
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
    const { accessToken, email, redirectUrl, captchaToken } = params
    return this.http.post(this.updateEmailUrl, { body: { email, redirectUrl, captchaToken }, accessToken })
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
      accessToken
    })
  }

  verifyPhoneNumber(params: VerifyPhoneNumberParams): Promise<void> {
    const { accessToken, ...data } = params
    const { phoneNumber } = data
    return this.http
        .post(this.verifyPhoneNumberUrl, { body: data, accessToken })
        .then(() => this.eventManager.fireEvent('profile_updated', { phoneNumber, phoneNumberVerified: true }))
  }

  verifyEmail(params: VerifyEmailParams): Promise<void> {
    const { email } = params
    return this.http.post<void>(this.verifyEmailUrl, { body: params })
      .then(() => this.eventManager.fireEvent("profile_updated", {email, emailVerified: true}))
  }
}
