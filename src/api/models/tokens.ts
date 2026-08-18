/**
 * Token and scope primitives shared across flows.
 */
export type OrchestrationToken = string

export type AuthenticationToken = { tkn?: string; mfaRequired?: boolean }

export type Scope = string | string[]
