import ApiClient, { LoginWithPasswordParams } from './apiClient'
import { apiClientConfig } from './apiClientConfig'
import { ajax } from './ajax'


type SdkCreationConfig = {
  domain: string
  clientId: string
}

export default function createSdk(creationConfig: SdkCreationConfig) {
  const { domain, clientId } = creationConfig

  const apiClient = ajax({
    url: `https://${domain}/identity/v1/config/${clientId}`,
    validator: apiClientConfig
  })
  .then(config => new ApiClient(config))

 
  function loginWithPassword(params: LoginWithPasswordParams) {
    return apiClient.then(api => api.loginWithPassword(params))
  }

  return {
    loginWithPassword
  }
}