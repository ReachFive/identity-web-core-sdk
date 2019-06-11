import WinChan from 'winchan'

class WinChanMocker {
  initialized = false
  receivedParams: any

  mockOpenSuccess(result: any) {
    if (this.initialized) {
      throw new Error('Already mocked')
    }
    WinChan.open = jest.fn().mockImplementationOnce((params, callback) => {
      this.receivedParams = params
      callback(null, result)
    })
  }

  mockOpenError(err: any) {
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
