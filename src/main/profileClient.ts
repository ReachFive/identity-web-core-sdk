import type { CaptchaParams } from './captcha'
import type { ApiClientConfig } from './config'
import type { Http } from '../api/http/pipeline'
import type { IdentityEventManager } from './identityEventManager'
import type { OpenIdUser, Profile, SessionDevice, SessionDeviceListResponse } from '../api/models'

export type UpdateEmailParams = {
  accessToken: string
  email: string
  redirectUrl?: string
} & CaptchaParams

export type EmailVerificationParams = {
  accessToken: string
  redirectUrl?: string
  returnToAfterEmailConfirmation?: string
}

export type PhoneNumberVerificationParams = { accessToken: string }

type EmailRequestPasswordResetParams = {
  email: string
  loginLink?: string
  origin?: string
  redirectUrl?: string
  returnToAfterPasswordReset?: string
} & CaptchaParams

type SmsRequestPasswordResetParams = {
  phoneNumber: string
  origin?: string
} & CaptchaParams

export type RequestPasswordResetParams = EmailRequestPasswordResetParams | SmsRequestPasswordResetParams

type EmailRequestAccountRecoveryParams = {
  email: string
  redirectUrl?: string
  loginLink?: string
  returnToAfterAccountRecovery?: string
} & CaptchaParams

type SmsRequestAccountRecoveryParams = {
  phoneNumber: string
} & CaptchaParams

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

export type RemoveSessionDeviceParams = {
  accessToken: string
  sessionDeviceId: string
}

type SmsVerificationCodeUpdatePasswordParams = {
  accessToken?: string
  phoneNumber: string
  verificationCode: string
  password: string
}
export type UpdatePasswordParams =
  AccessTokenUpdatePasswordParams | EmailVerificationCodeUpdatePasswordParams | SmsVerificationCodeUpdatePasswordParams

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
  private http: Http
  private eventManager: IdentityEventManager

  private sendEmailVerificationUrl: string
  private sendPhoneNumberVerificationUrl: string
  private sessionDevicesUrl: string
  private signupDataUrl: string
  private unlinkUrl: string
  private updateEmailUrl: string
  private updatePasswordUrl: string
  private updatePhoneNumberUrl: string
  private updateProfileUrl: string
  private userInfoUrl: string
  private verifyPhoneNumberUrl: string
  private verifyEmailUrl: string

  constructor(props: { config: ApiClientConfig; http: Http; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager

    this.sendEmailVerificationUrl = '/identity/v1/send-email-verification'
    this.sendPhoneNumberVerificationUrl = '/identity/v1/send-phone-number-verification'
    this.sessionDevicesUrl = '/identity/v1/session-devices'
    this.signupDataUrl = '/identity/v1/signup/data'
    this.unlinkUrl = '/identity/v1/unlink'
    this.updateEmailUrl = '/identity/v1/update-email'
    this.updatePasswordUrl = '/identity/v1/update-password'
    this.updatePhoneNumberUrl = '/identity/v1/update-phone-number'
    this.updateProfileUrl = '/identity/v1/update-profile'
    this.userInfoUrl = '/identity/v1/userinfo'
    this.verifyPhoneNumberUrl = '/identity/v1/verify-phone-number'
    this.verifyEmailUrl = '/identity/v1/verify-email'
  }

  listSessionDevices(accessToken: string): Promise<SessionDevice[]> {
    return this.http
      .get<SessionDeviceListResponse>(this.sessionDevicesUrl, { accessToken })
      .then((res) => res.sessionDevices)
  }

  removeSessionDevice(params: RemoveSessionDeviceParams): Promise<void> {
    const { accessToken, sessionDeviceId } = params
    return this.http.delete<void>(`${this.sessionDevicesUrl}/${sessionDeviceId}`, { accessToken })
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
    return this.http.post('/identity/v1/account-recovery', {
      body: {
        clientId: this.config.clientId,
        ...params
      }
    })
  }

  requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
    return this.http.post('/identity/v1/forgot-password', {
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
    return this.http
      .post<void>(this.verifyEmailUrl, { body: params })
      .then(() => this.eventManager.fireEvent('profile_updated', { email, emailVerified: true }))
  }
}
