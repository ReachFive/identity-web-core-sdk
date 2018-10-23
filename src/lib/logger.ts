
export function log(msg: string) {
  if (window.console && window.console.log) window.console.log(msg)
}

export function logError(messageOrException: string | Error, exception?: Error) {
  if (window.console) {
    if (window.console.error) {
      if (exception) {
        window.console.error(messageOrException, exception)
      }
      else {
        window.console.error(messageOrException)
      }
    }
    else if (window.console.log) {
      window.console.log(messageOrException)
    }
  }
}