import { AuthResult, enrichAuthResult } from './authResult'
import EventManager from '../lib/eventManager'
import { ErrorResponse, Profile } from '../shared/model'

export type Events = {
  'authenticated': AuthResult
  'profile_updated': Partial<Profile>
  'authentication_failed': ErrorResponse
  'login_failed': ErrorResponse
  'signup_failed': ErrorResponse
}

export type IdentityEventManager = {
  on: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void;
  off: <K extends keyof Events>(eventName: K, listener: (payload: Events[K]) => void) => void;
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
      if (eventName === 'authenticated') {
        data = enrichAuthResult(data)
      }
      eventManager.fire(eventName, data)
    }
  }
}