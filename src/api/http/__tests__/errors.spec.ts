/**
 * @jest-environment node
 */
import { ErrorResponse } from '../../models'
import { ApiError } from '../errors'

describe('ApiError', () => {
  test('is a real Error, with a stack and a name', () => {
    const error = new ApiError(401, { error: 'invalid_token' })

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.name).toBe('ApiError')
    expect(error.stack).toEqual(expect.any(String))
  })

  test('carries the status and exposes the error fields as its own properties', () => {
    const body = {
      error: 'email_already_exists',
      errorDescription: 'Email already in use',
      errorUserMsg: 'Another account with the same email address already exists',
      errorMessageKey: 'error.email.alreadyInUse'
    }

    const error = new ApiError(409, body)

    expect(error.status).toBe(409)
    expect(error.body).toBe(body)
    expect(error).toMatchObject(body)
  })

  test('satisfies the public ErrorResponse type guard', () => {
    expect(ErrorResponse.isErrorResponse(new ApiError(400, { error: 'invalid_request' }))).toBe(true)
  })

  test('prefers the description, then the error code, then the status for its message', () => {
    expect(new ApiError(400, { error: 'invalid_request', errorDescription: 'Missing field' }).message).toBe(
      'Missing field'
    )
    expect(new ApiError(400, { error: 'invalid_request' }).message).toBe('invalid_request')
    expect(new ApiError(502, '<html>Bad Gateway</html>').message).toBe('HTTP 502')
  })

  test('never lets the body overwrite what makes it an Error', () => {
    const error = new ApiError(400, {
      error: 'x',
      status: 999,
      message: 'spoofed',
      name: 'Nope',
      stack: 'fake',
      toString: 'not a function',
      constructor: 'nope'
    })

    expect(String(error)).toBe('ApiError: x')
    expect(error.constructor).toBe(ApiError)
    expect(error.status).toBe(400)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('x')
    expect(error.stack).not.toBe('fake')
  })
})
