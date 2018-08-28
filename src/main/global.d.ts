
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>


declare module 'winchan' {
  type Winchan = {
    open: any
  }

  const Winchan: Winchan

  export = Winchan
}