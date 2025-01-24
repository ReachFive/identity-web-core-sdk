import { ResponseType } from '../../authOptions'
import { toQueryString } from '../../../utils/queryString'
import { pick } from '../../../utils/utils'
import { AuthParameters } from '../../authParameters'

export const mockPkceValues = {
  code_challenge: 'KBHQASQDHCtWjDGVGQaPjsK8c8SlrH2yfm3nQh75o14',
  code_challenge_method: 'S256',
}

export const defaultScope = 'openid profile email phone'

export const scope = { scope: defaultScope }
export const token = { responseType: 'token' }
export const code = { responseType: 'code', redirectUri: 'http://mysite.com/login/callback' }

type TknType = {
  tkn: string
}
export const tkn: TknType = { tkn: 'authntkn' }

export const email = {
  email: 'john.doe@example.com',
  password: 'izDf8£Zd'
}

export const phone = {
  phone_number: 'john.doe@example.com',
  password: 'izDf8£Zd'
}

type ClientType = {
  isPublic: boolean
}
export const pblic = { isPublic: true }
export const confidential = { isPublic: false }

export const webMessage = { responseMode: 'web_message', prompt: 'none' }

export const pageDisplay = { display: 'page' }
export const popupDisplay = { display: 'popup' }

type ExpectedPkceResult<IsPublic, ResponseType> =
  IsPublic extends true ?
    ResponseType extends 'code' ?
        typeof mockPkceValues :
        Record<string, never> :
    Record<string, never>

function expectedPkce(isPublic: boolean, responseType: ResponseType): ExpectedPkceResult<typeof isPublic, typeof responseType> {
  return (isPublic && responseType === 'code')
    ? mockPkceValues
    : {}
}

export function getExpectedQueryString(params: ClientType & AuthParameters & Partial<TknType>): string {
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
