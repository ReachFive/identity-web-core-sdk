declare module 'winchan' {
  type Winchan = {
    open: any
  }

  const Winchan: Winchan

  export = Winchan
}

type BrowserTab = {
  openUrl(url: string, onSuccess: () => void, onError: (error: Error) => void): void
  close(): void
  isAvailable(onResponse: (available: boolean) => void, onError: () => void): void
}

interface Window {
  cordova?: {
    plugins?: {
      browsertab?: BrowserTab
    }
    InAppBrowser?: {
      open(url: string, target: '_self' | '_blank' | '_system'): void | InAppBrowser
    },
    platformId?: 'ios' | 'android'
  }
  handleOpenURL?: (url: string) => void
}
