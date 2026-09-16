export type CaptchaProvider = 'recaptcha' | 'recaptcha_enterprise' | 'captchafox'

export type CaptchaParams = {
  captchaToken?: string
  captchaProvider?: CaptchaProvider
}
