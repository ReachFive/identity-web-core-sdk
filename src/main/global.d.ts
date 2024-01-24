declare module 'winchan' {
  type WinChanOptions = {
    url?: string,
    params?: unknown
    relay_url?: string,
    window_name?: Parameters<typeof window.open>[1],
    window_features?: Parameters<typeof window.open>[2],
    origin?: string,
    popup?: boolean
  }

  interface WinChanCallback<T> {
    (err: string | Error, result: undefined): void;
    (err: null, result: T): void;
  }
    
  
  type Winchan = {
    open: <R>(opts: WinChanOptions, cb: WinChanCallback<R>) => void
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
