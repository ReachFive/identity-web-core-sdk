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
