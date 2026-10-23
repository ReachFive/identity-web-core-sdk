import type { FieldError } from '../models'

/**
 * Raised for every non-2xx API response.
 *
 * Unlike the raw JSON body the SDK has always rejected with, this is a real `Error`: it has a stack,
 * `instanceof` works, and error trackers capture it. It keeps the HTTP `status`, and copies the body's
 * fields onto itself so that code reading `error.error` or `error.errorDescription` keeps working.
 */
export class ApiError extends Error {
  readonly status: number
  /** The decoded, camel-cased response body — or its raw text when it was not JSON. */
  readonly body: unknown

  declare readonly error?: string
  declare readonly errorDescription?: string
  declare readonly errorUserMsg?: string
  declare readonly errorMessageKey?: string
  declare readonly errorDetails?: FieldError[]

  constructor(status: number, body: unknown) {
    super(messageOf(status, body))
    this.name = 'ApiError'
    this.status = status
    this.body = body

    if (isRecord(body)) {
      for (const [key, value] of Object.entries(body)) {
        // Anything the error already has (status, message, stack, toString, constructor, …) is what
        // makes it an Error: a body field must never shadow it.
        if (!(key in this)) Object.defineProperty(this, key, { value, enumerable: true })
      }
    }
  }
}

function messageOf(status: number, body: unknown): string {
  if (isRecord(body)) {
    if (typeof body.errorDescription === 'string') return body.errorDescription
    if (typeof body.error === 'string') return body.error
  }
  return `HTTP ${status}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
