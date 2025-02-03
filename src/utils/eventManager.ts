import { logError } from './logger'

type Listeners<K extends keyof EVENTS, EVENTS> = Array<(data: EVENTS[K]) => void>

export default class EventManager<EVENTS extends object> {
  private listeners: { [K in keyof EVENTS]?: Listeners<K, EVENTS> } = {}

  fire<K extends keyof EVENTS>(name: K, data: EVENTS[K]) {
    this.getListeners(name).forEach(listener => {
      try {
        listener(data)
      } catch (e) {
        logError(e)
      }
    })
  }

  on<K extends keyof EVENTS>(name: K, listener: (data: EVENTS[K]) => void) {
    this.getListeners(name).push(listener)
  }

  off<K extends keyof EVENTS>(name: K, listener: (data: EVENTS[K]) => void) {
    this.listeners[name] = this.getListeners(name).filter(l => l !== listener)
  }

  private getListeners<K extends keyof EVENTS>(name: K): Array<(data: EVENTS[K]) => void> {
    let listeners: Array<(data: EVENTS[K]) => void> | undefined = this.listeners[name]

    if (!listeners) {
      listeners = this.listeners[name] = []
    }

    return listeners
  }
}
