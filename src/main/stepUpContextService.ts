export type StepUpContext = {
  /** `web_message` to receive the authorization response in an iframe instead of navigating the page. */
  responseMode?: string
  /** Redirect uri used:
   * - when an error occurs during redirection flow
   * - during a web_message flow
   * */
  redirectUri?: string
}

type StoredStepUpContext = { context: StepUpContext; expiresAt: number }

const keyPrefix = 'stepup_context:'

/** Well beyond the lifetime of a step-up to purge expired tokens. */
const timeToLive = 60 * 60 * 1000

export function storeStepUpContext(stepUpToken: string, context: StepUpContext): void {
  purgeExpiredContexts()
  const stored: StoredStepUpContext = { context, expiresAt: Date.now() + timeToLive }
  localStorage.setItem(storageKey(stepUpToken), JSON.stringify(stored))
}

export function getStepUpContext(stepUpToken: string): StepUpContext | undefined {
  const key = storageKey(stepUpToken)
  const stored = readStoredContext(key)
  if (!stored) localStorage.removeItem(key)
  return stored?.context
}

export function removeStepUpContext(stepUpToken: string): void {
  localStorage.removeItem(storageKey(stepUpToken))
}

function storageKey(stepUpToken: string): string {
  return `${keyPrefix}${stepUpToken}`
}

function readStoredContext(key: string): StoredStepUpContext | undefined {
  const storedValue = localStorage.getItem(key)
  if (!storedValue) return undefined
  try {
    const stored = JSON.parse(storedValue) as StoredStepUpContext
    return stored.expiresAt > Date.now() ? stored : undefined
  } catch (_e) {
    return undefined
  }
}

function purgeExpiredContexts(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(keyPrefix) && !readStoredContext(key))
    .forEach((key) => localStorage.removeItem(key))
}
