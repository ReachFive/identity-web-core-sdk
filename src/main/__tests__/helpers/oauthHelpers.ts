import pick from 'lodash/pick'

import { toQueryString } from '../../../utils/queryString'
import { ResponseType } from '../../authOptions'
import { AuthParameters } from '../../authParameters'
import { PkceParams } from '../../pkceService'

export const mockPkceValues = {
  code_challenge: 'KBHQASQDHCtWjDGVGQaPjsK8c8SlrH2yfm3nQh75o14',
  code_challenge_method: 'S256',
}

function expectedPkce(isPublic: boolean, responseType: ResponseType): PkceParams | {} {
  return isPublic && responseType === 'code' ? mockPkceValues : {}
}

export const defaultScope = 'openid profile email phone'

export const scope = { scope: defaultScope }
export const token = { responseType: 'token' }
export const code = {
  responseType: 'code',
  redirectUri: 'http://mysite.com/login/callback',
}

export const tkn = { tkn: 'authntkn' }

export const email = {
  email: 'john.doe@example.com',
  password: 'izDf8£Zd',
}

export const phone = {
  phone_number: 'john.doe@example.com',
  password: 'izDf8£Zd',
}

type ClientType = {
  isPublic: boolean
}

export const _public = { isPublic: true }
export const confidential = { isPublic: false }

export const webMessage = { responseMode: 'web_message', prompt: 'none' }

export const pageDisplay = { display: 'page' }

export function getExpectedQueryString(params: ClientType & AuthParameters): string {
  const responseType = params['responseType']
  const isPublic = params['isPublic']
  const pkceValues = expectedPkce(isPublic, responseType)

  return toQueryString({
    client_id: 'ijzdfpidjf',
    response_type: responseType,
    ...pick(params, 'redirectUri'),
    ...pick(params, 'origin'),
    ...pick(params, 'state'),
    ...pick(params, 'nonce'),
    ...pick(params, 'providerScope'),
    ...scope,
    ...pick(params, 'display'),
    ...pick(params, 'responseMode'),
    ...pick(params, 'prompt'),
    ...pkceValues,
    ...pick(params, 'tkn'),
  })
}
