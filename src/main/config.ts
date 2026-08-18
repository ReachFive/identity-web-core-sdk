import type { OrchestrationToken, RemoteSettings } from '../api/models'

/**
 * Options accepted by `createClient`.
 */
export interface Config {
  clientId: string
  domain: string
  /**
   * Used to define which Google provider variant to use with Google One Tap
   * @default "default"
   * */
  googleVariant?: string
  language?: string
  locale?: string
  webAuthnOrigin?: string
}

/**
 * What every sub-client is handed once the `/identity/v1/config` bootstrap has resolved: the
 * creation config, the resolved base URL and the server-side settings that gate behaviour at
 * runtime (`sso`, `isPublic`, `pkceEnforced`, …).
 *
 * This lives here rather than in `main.ts` so that sub-clients do not have to import from the
 * module that constructs them, which used to make every one of them part of an import cycle.
 */
export type ApiClientConfig = RemoteSettings & {
  clientId: string
  baseUrl: string
  orchestrationToken?: OrchestrationToken
}
