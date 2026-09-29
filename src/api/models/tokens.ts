/**
 * Token and scope primitives shared across flows.
 */
export type OrchestrationToken = string

export type AuthenticationToken = {
  tkn?: string
  mfaRequired?: boolean
  /** The new profile's id, on signup. */
  id?: string
}

export type Scope = string | string[]
