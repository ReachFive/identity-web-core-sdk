import { keys, Set } from '../../lib/obj'

const providers = Set(
  'facebook',
  'google',
  'linkedin',
  'microsoft',
  'twitter',
  'instagram',
  'paypal',
  'amazon',
  'vkontakte',
  'weibo',
  'wechat',
  'qq',
  'line',
  'yandex',
  'mailru',
  'kakaotalk'
)

export type ProviderId = keyof typeof providers

export default keys(providers)