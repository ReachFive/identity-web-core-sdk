export type CaptchaProvider = 'recaptcha' | 'captchafox'

export type CaptchaParams = {
  captchaToken?: string
  captchaProvider?: CaptchaProvider
}
