import { UrlParser } from './urlParser'

export function initCordovaCallbackIfNecessary(urlParser: UrlParser): void {
  if (!window.cordova) return
  if (window.handleOpenURL) return

  window.handleOpenURL = url => {
    const cordova = window.cordova
    if (!cordova) return

    const parsed = urlParser.checkUrlFragment(url)

    if (parsed && cordova.plugins && cordova.plugins.browsertab) {
      cordova.plugins.browsertab.close()
    }
  }
}
