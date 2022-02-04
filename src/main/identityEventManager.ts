import EventManager from '../utils/eventManager'
import { AuthResult, enrichAuthResult } from './authResult'
import { ErrorResponse, Profile } from './models'

export type Events = {
  authenticated: AuthResult
  profile_updated: Partial<Profile>
  authentication_failed: ErrorResponse
  login_failed: ErrorResponse
  signup_failed: ErrorResponse
}

/**
 * Event manager dedicated to Identity SDK events
 */
export type IdentityEventManager = {
  on: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  off: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void
  fireEvent: <K extends keyof Events>(eventName: K, data: Events[K]) => void
}

export default function createEventManager(): IdentityEventManager {
  const eventManager = new EventManager<Events>()

  return {
    on<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) {
      eventManager.on(eventName, listener)
    },

    off<K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) {
      eventManager.off(eventName, listener)
    },

    fireEvent<K extends keyof Events>(eventName: K, data: Events[K]) {
      if ((eventName as string) === 'authenticated') {
        const ar: AuthResult = enrichAuthResult(data as AuthResult)
        eventManager.fire(eventName, ar as Events[K])
      } else {
        eventManager.fire(eventName, data)
      }
    },
  }
}
