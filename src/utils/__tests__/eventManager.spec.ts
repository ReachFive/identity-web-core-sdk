import EventManager from '../eventManager'

describe('EventManager', () => {
  test('can add and remove a listener', () => {
    type Events = {
      myEvent1: number
      myEvent2: number
    }

    const eventManager = new EventManager<Events>()

    const handler = jest.fn()

    eventManager.on('myEvent1', handler)

    eventManager.fire('myEvent1', 1)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(1)

    // Wrong event name
    eventManager.off('myEvent2', handler)

    eventManager.fire('myEvent1', 2)

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith(2)

    // Wrong handler
    eventManager.off('myEvent1', () => void {})

    eventManager.fire('myEvent1', 3)

    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenCalledWith(3)

    // Proper removal logic
    eventManager.off('myEvent1', handler)

    eventManager.fire('myEvent1', 4)

    expect(handler).toHaveBeenCalledTimes(3)
  })
})
