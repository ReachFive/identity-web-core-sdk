export type Profile = Record<string, any>

export type SsoData = {
  isAuthenticated: true
  name?: string
  email?: string
  lastLoginType?: string
  hasPassword?: boolean
  socialProviders?: string[]
}

export type ErrorResponse = {
  error: string
  errorDescription?: string
  errorUserMsg?: string
  errorDetails?: FieldError[]
}

export type FieldError = {
  field: string
  message: string
  code: 'missing' | 'invalid'
}

export namespace ErrorResponse {

  export function isErrorResponse(thing: any): thing is ErrorResponse {
    return thing && thing.error
  }

}