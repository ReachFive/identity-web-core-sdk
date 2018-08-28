import pull from 'lodash-es/pull'
import { logError } from './logger'


type Listeners<K extends keyof EVENTS, EVENTS> = Array<(data: EVENTS[K]) => void>


export default class EventManager<EVENTS extends {}> {

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

  addListener<K extends keyof EVENTS>(name: K, listener: (data: EVENTS[K]) => void) {
    this.getListeners(name).push(listener)
  }

  removeListener<K extends keyof EVENTS>(name: K, listener: (data: EVENTS[K]) => void) {     
    pull(this.getListeners(name), listener)
  }

  private getListeners<K extends keyof EVENTS>(name: K): Array<(data: EVENTS[K]) => void> {
    let listeners: Array<(data: EVENTS[K]) => void> | undefined = this.listeners[name]

    if (!listeners) {
      listeners = this.listeners[name] = []
    }

    return listeners
  }
}