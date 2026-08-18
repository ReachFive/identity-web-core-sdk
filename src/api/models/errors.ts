/**
 * The error envelope every non-2xx API response rejects with.
 */
export type ErrorResponse = {
  error: string
  errorDescription?: string
  errorUserMsg?: string
  errorDetails?: FieldError[]
  errorMessageKey?: string
}

export type FieldError = {
  field: string
  message: string
  code: 'missing' | 'invalid'
}

// Declaration merging is what puts `isErrorResponse` on the exported `ErrorResponse` type.
// It is public API, so flattening it would be a breaking change.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ErrorResponse {
  export function isErrorResponse(thing: unknown): thing is ErrorResponse {
    return typeof thing === 'object' && thing !== null && 'error' in thing
  }
}
