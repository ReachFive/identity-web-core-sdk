
export type PopupSize = {
  width: number
  height: number
}

export function popupSize(provider: string): PopupSize {
  switch (provider) {
    case 'amazon':    return { width: 715, height: 525 }
    case 'facebook':  return { width: 650, height: 400 }
    case 'google':    return { width: 560, height: 630 }
    case 'instagram': return { width: 440, height: 750 }
    case 'kakaotalk': return { width: 450, height: 400 }
    case 'line':      return { width: 440, height: 550 }
    case 'mailru':    return { width: 450, height: 400 }
    case 'qq':        return { width: 450, height: 400 }
    case 'twitter':   return { width: 800, height: 440 }
    case 'vkontakte': return { width: 655, height: 430 }
    case 'yandex':    return { width: 655, height: 700 }
    default:          return { width: 400, height: 550 }
  }
}
