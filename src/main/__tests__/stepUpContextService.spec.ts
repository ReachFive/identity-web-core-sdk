import { getStepUpContext, removeStepUpContext, storeStepUpContext } from '../stepUpContextService'

beforeEach(() => {
  localStorage.clear()
  jest.useRealTimers()
})

const anHour = 60 * 60 * 1000

describe('web message step-up context', () => {
  test('is returned for the step-up token it was stored with', () => {
    storeStepUpContext('stepUpToken', { redirectUri: 'https://example.com/callback' })

    expect(getStepUpContext('stepUpToken')).toEqual({ redirectUri: 'https://example.com/callback' })
  })

  test('is not overwritten by the context of another step-up', () => {
    storeStepUpContext('stepUpToken', { redirectUri: 'https://example.com/callback' })
    storeStepUpContext('otherStepUpToken', { redirectUri: 'https://example.com/other' })

    expect(getStepUpContext('stepUpToken')).toEqual({ redirectUri: 'https://example.com/callback' })
    expect(getStepUpContext('otherStepUpToken')).toEqual({ redirectUri: 'https://example.com/other' })
  })

  test('is kept until removed', () => {
    storeStepUpContext('stepUpToken', { redirectUri: 'https://example.com/callback' })
    getStepUpContext('stepUpToken')

    expect(getStepUpContext('stepUpToken')).toEqual({ redirectUri: 'https://example.com/callback' })

    removeStepUpContext('stepUpToken')

    expect(getStepUpContext('stepUpToken')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })

  test('is absent when the step-up was not requested in web message mode', () => {
    expect(getStepUpContext('stepUpToken')).toBeUndefined()
  })

  test('expires after an hour', () => {
    jest.useFakeTimers({ now: 0 })
    storeStepUpContext('stepUpToken', { redirectUri: 'https://example.com/callback' })

    jest.setSystemTime(anHour - 1)
    expect(getStepUpContext('stepUpToken')).toEqual({ redirectUri: 'https://example.com/callback' })

    jest.setSystemTime(anHour)
    expect(getStepUpContext('stepUpToken')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })

  test('purges the expired contexts of other step-ups, and only them, when a new one is stored', () => {
    jest.useFakeTimers({ now: 0 })
    storeStepUpContext('abandonedStepUpToken', {})
    localStorage.setItem('unrelated', 'value')
    jest.setSystemTime(anHour / 2)
    storeStepUpContext('ongoingStepUpToken', {})

    jest.setSystemTime(anHour)
    storeStepUpContext('stepUpToken', {})

    expect(Object.keys(localStorage).sort()).toEqual([
      'stepup_context:ongoingStepUpToken',
      'stepup_context:stepUpToken',
      'unrelated'
    ])
  })

  test('is absent when unreadable', () => {
    localStorage.setItem('stepup_context:stepUpToken', 'not json')

    expect(getStepUpContext('stepUpToken')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })
})
