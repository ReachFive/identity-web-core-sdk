import type { CaptchaParams } from './captcha'
import type { ApiClientConfig } from './config'
import type { HttpClient } from './httpClient'
import { toWireProfileData } from './profileData'
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
  /** @deprecated Not read by the API, and no longer sent. */
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
  /** @deprecated Not read by the API, and no longer sent. */
  loginLink?: string
  returnToAfterAccountRecovery?: string
} & CaptchaParams

type SmsRequestAccountRecoveryParams = {
  phoneNumber: string
} & CaptchaParams

export type RequestAccountRecoveryParams = EmailRequestAccountRecoveryParams | SmsRequestAccountRecoveryParams

type AccessTokenUpdatePasswordParams = {
  /** Required without a verification code: the API identifies the user by this token. */
  accessToken: string
  password: string
  oldPassword?: string
  /** @deprecated Not read by the API, and no longer sent: the user is the one the token identifies. */
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
  /**
   * The API only updates `email`, `phoneNumber`, `givenName`, `middleName`, `familyName`, `name`, `nickname`,
   * `username`, `birthdate`, `gender`, `addresses`, `picture`, `company`, `locale`, `customFields`, `consents`
   * and `customIdentifier`. Any other field is silently ignored.
   */
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
// `loginLink` is not read by the API, which builds its own links.
function withoutLoginLink<T extends object>(params: T): Omit<T, 'loginLink'> {
  const { loginLink: _loginLink, ...rest } = params as T & { loginLink?: string }
  return rest
}

export default class ProfileClient {
  private config: ApiClientConfig
  private http: HttpClient
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

  constructor(props: { config: ApiClientConfig; http: HttpClient; eventManager: IdentityEventManager }) {
    this.config = props.config
    this.http = props.http
    this.eventManager = props.eventManager

    this.sendEmailVerificationUrl = '/send-email-verification'
    this.sendPhoneNumberVerificationUrl = '/send-phone-number-verification'
    this.sessionDevicesUrl = '/session-devices'
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

  listSessionDevices(accessToken: string): Promise<SessionDevice[]> {
    return this.http
      .get<SessionDeviceListResponse>(this.sessionDevicesUrl, { accessToken })
      .then((res) => res.sessionDevices)
  }

  removeSessionDevice(params: RemoveSessionDeviceParams): Promise<void> {
    const { accessToken, sessionDeviceId } = params
    return this.http.remove<void>(`${this.sessionDevicesUrl}/${sessionDeviceId}`, { accessToken })
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
        ...withoutLoginLink(params)
      }
    })
  }

  requestPasswordReset(params: RequestPasswordResetParams): Promise<void> {
    return this.http.post('/forgot-password', {
      body: {
        clientId: this.config.clientId,
        ...withoutLoginLink(params)
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
    const { accessToken, email, redirectUrl, captchaToken, captchaProvider } = params
    return this.http.post(this.updateEmailUrl, {
      body: { email, redirectUrl, captchaToken, captchaProvider },
      accessToken
    })
  }

  updatePhoneNumber(params: UpdatePhoneNumberParams): Promise<void> {
    const { accessToken, ...data } = params
    return this.http.post(this.updatePhoneNumberUrl, { body: data, accessToken })
  }

  updateProfile(params: UpdateProfileParams): Promise<void> {
    const { accessToken, redirectUrl, data } = params
    return this.http
      .post(this.updateProfileUrl, { body: { ...toWireProfileData(data), redirectUrl }, accessToken })
      .then(() => this.eventManager.fireEvent('profile_updated', data))
  }

  updatePassword(params: UpdatePasswordParams): Promise<void> {
    // `userId` is not read by the API: the user is the one the access token or verification code identifies.
    const { accessToken, userId: _userId, ...data } = params as UpdatePasswordParams & { userId?: string }
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
