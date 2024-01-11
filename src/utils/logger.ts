export function log(message: string) {
  if (window.console && window.console.log) window.console.log(message)
}

export function logWarn(message: string) {
  if (window.console && window.console.warn) window.console.warn(message)
}

export function logError(messageOrException: unknown, exception?: unknown) {
  if (window.console) {
    if (window.console.error) {
      if (exception) {
        window.console.error(messageOrException, exception)
      } else {
        window.console.error(messageOrException)
      }
    } else if (window.console.log) {
      window.console.log(messageOrException)
    }
  }
}
