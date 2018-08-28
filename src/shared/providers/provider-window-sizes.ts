import { ProviderId } from './providers'
import amazonWindowSize from './amazon/window-size'
import facebookWindowSize from './facebook/window-size'
import googleWindowSize from './google/window-size'
import instagramWindowSize from './instagram/window-size'
import kakaotalkWindowSize from './kakaotalk/window-size'
import lineWindowSize from './line/window-size'
import mailruWindowSize from './mailru/window-size'
import qqWindowSize from './qq/window-size'
import twitterWindowSize from './twitter/window-size'
import vkontakteWindowSize from './vkontakte/window-size'
import yandexWindowSize from './yandex/window-size'


type WindowSizes = { [ID in ProviderId]?: { width: number, height: number } }

const windowSizes: WindowSizes = {
  amazon: amazonWindowSize,
  facebook: facebookWindowSize,
  google: googleWindowSize,
  instagram: instagramWindowSize,
  kakaotalk: kakaotalkWindowSize,
  line: lineWindowSize,
  mailru: mailruWindowSize,
  qq: qqWindowSize,
  twitter: twitterWindowSize,
  vkontakte: vkontakteWindowSize,
  yandex: yandexWindowSize
}

export default windowSizes