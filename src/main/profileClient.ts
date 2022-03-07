import {
  Profile,
  OpenIdUser,
} from './models'
import { IdentityEventManager } from './identityEventManager'
import { HttpClient } from './httpClient'
import { ApiClientConfig } from './main'

export type UpdateEmailParams = { accessToken: string; email: string; redirectUrl?: string }

export type EmailVerificationParams = { accessToken: string; redirectUrl?: string; returnToAfterEmailConfirmation?: string }

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

/**
 * Identity Rest API Client
 */
export default class ProfileClient {
  private config: ApiClientConfig
  private http: HttpClient
  private eventManager: IdentityEventManager

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager
  }

  getSignupData(signupToken: string): Promise<OpenIdUser> {
    return this.http.get<OpenIdUser>('/signup/data', {
      query: {
        clientId: this.config.clientId,
        token: signupToken
      }
    })
  }

  getUser({ accessToken, fields }: { accessToken: string; fields?: string }): Promise<Profile> {
    return this.http.get<Profile>('/userinfo', { query: { fields }, accessToken })
  }

  updateProfile({
    accessToken,
    redirectUrl,
    data
  }: {
    accessToken: string
    redirectUrl?: string
    data: Profile
  }): Promise<void> {
    return this.http
        .post('/update-profile', { body: { ...data, redirectUrl }, accessToken })
        .then(() => this.eventManager.fireEvent('profile_updated', data))
  }

  sendEmailVerification(params: EmailVerificationParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post('/send-email-verification', { body: { ...data }, accessToken })
  }

  sendPhoneNumberVerification(params: PhoneNumberVerificationParams): Promise<void> {
    const { accessToken } = params
    return this.http.post('/send-phone-number-verification', { accessToken })
  }

  updateEmail(params: UpdateEmailParams): Promise<void> {
    const { accessToken, email, redirectUrl } = params
    return this.http.post('/update-email', { body: { email, redirectUrl }, accessToken })
  }

  updatePhoneNumber(params: { accessToken: string; phoneNumber: string }): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post('/update-phone-number', { body: data, accessToken })
  }

  verifyPhoneNumber({
    accessToken,
    ...data
  }: {
    accessToken: string
    phoneNumber: string
    verificationCode: string
  }): Promise<void> {
    const { phoneNumber } = data
    return this.http
      .post('/verify-phone-number', { body: data, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', { phoneNumber, phoneNumberVerified: true }))
  }

  requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
    return this.http.post('/forgot-password', {
      body: {
        clientId: this.config.clientId,
        ...params
      }
    })
  }

  updatePassword(params: UpdatePasswordParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post('/update-password', {
      body: { clientId: this.config.clientId, ...data },
      accessToken
    })
  }

  unlink({ accessToken, ...data }: { accessToken: string; identityId: string; fields?: string }): Promise<void> {
    return this.http.post('/unlink', { body: data, accessToken })
  }
}
