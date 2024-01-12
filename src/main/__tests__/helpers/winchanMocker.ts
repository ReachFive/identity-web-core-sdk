import WinChan from 'winchan'

class WinChanMocker {
  initialized = false
  receivedParams: unknown

  mockOpenSuccess(result: unknown) {
    if (this.initialized) {
      throw new Error('Already mocked')
    }
    WinChan.open = jest.fn().mockImplementationOnce((params, callback) => {
      this.receivedParams = params
      callback(null, result)
    })
  }

  mockOpenError(err: unknown) {
    if (this.initialized) {
      throw new Error('Already mocked')
    }
    WinChan.open = jest.fn().mockImplementationOnce((params, callback) => {
      this.receivedParams = params
      callback(err)
    })
  }

  reset() {
    delete this.receivedParams
  }
}

export default new WinChanMocker()
