import EventManager from '../eventManager'


describe('EventManager', () => {

  test('can add and remove a listener', () => {
    type Events = {
      myEvent: number,
      myEvent2: number
    }

    const em = new EventManager<Events>()

    const handler = jest.fn()

    em.on('myEvent', handler)

    em.fire('myEvent', 1)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(1)

    // Wrong event name
    em.off('myEvent2', handler)

    em.fire('myEvent', 2)

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith(2)


    // Wrong handler
    em.off('myEvent', function() { })

    em.fire('myEvent', 3)

    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenCalledWith(3)

    // Proper removal logic
    em.off('myEvent', handler)

    em.fire('myEvent', 4)

    expect(handler).toHaveBeenCalledTimes(3)
  })

})
