export type ErrorResponse = {
  error: string
  errorDescription?: string
}

export namespace ErrorResponse {

  export function isErrorResponse(thing: any): thing is ErrorResponse {
    return thing && thing.error
  }

}