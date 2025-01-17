import WinChan from 'winchan'

class WinChanMocker {
  initialized = false
  receivedParams: unknown

  mockOpenSuccess(result: unknown) {
    if (this.initialized) {
      throw new Error('Already mocked')
    }
    this.initialized = true
    WinChan.open = jest.fn().mockImplementationOnce((params, callback) => {
      this.receivedParams = params
      callback(null, result)
    })
  }

  mockOpenError(err: unknown) {
    if (this.initialized) {
      throw new Error('Already mocked')
    }
    this.initialized = true
    WinChan.open = jest.fn().mockImplementationOnce((params, callback) => {
      this.receivedParams = params
      callback(err)
    })
  }

  mockClear() {
    if (jest.isMockFunction(WinChan.open)) {
      WinChan.open.mockClear()
    } 
  }

  mockReset() {
    if (jest.isMockFunction(WinChan.open)) {
      WinChan.open.mockReset()
    } 
    this.initialized = false
  }

  reset() {
    delete this.receivedParams
  }
}

export default new WinChanMocker()
