# Changelog

## 1.19.0

### 12/10/2020

### Features

- Only generate a `code_challenge` for **public** clients in authorization code flows.
- Hardcode to `response_type=token` for **confidential** clients in web message requests.

### Fixes

Refactor tests to cover a wider set of request permutations.

## 1.18.1

### 11/30/2020

### Fixes

- The [loginWithSocialProvider](https://developer.reachfive.com/sdk-core/loginWithSocialProvider.html) method returns
  now the object reference from `InAppBrowser` within Cordova context.
- The `returnToAfterEmailConfirmation` parameter is added to
  the [signupWithWebAuthn](https://developer.reachfive.com/sdk-core/signupWithWebAuthn.html#params) method and allows to
  override the redirect URL specified in the *Signup* email template.
- The [verifyPasswordless](https://developer.reachfive.com/sdk-core/verifyPasswordless.html) method receives now
  correctly the `auth` options.

## 1.18.0

### 10/30/2020

### Features

- Generate a PKCE `code_challenge` by default in all authorization code flows (`responseType === 'code'`).
- Use the authorization code flow with PKCE in checkSession.

### Fixes

Rename erroneously named config value `pkceEnabled` to `pkceEnforced`.

## 1.17.2

### 10/02/2020

### Fixes

- Upgrade all dependencies.
- Fix IE/Edge window closing warning.

## 1.17.1

### 09/15/2020

### Fixes

Fix the CircleCi job to deploy a new version.

## 1.17.0

### 09/14/2020

### Features

Add a new method to signup with
Webauthn: [signupWithWebAuthn](https://developer.reachfive.com/sdk-core/signupWithWebAuthn.html).

## 1.16.0

### 09/10/2020

### Features

- The `acceptTos` (Term Of Service) parameter in the `AuthOptions` was removed.
- The generic authentication callback was updated, it no longer calls the same endpoint.
- A new `AuthOptions` parameter `useWebMessage` was added to leverage web messages and redirectionless authentication.
- The following methods return now a `Promise<AuthResult>` instead of `Promise<void`>:
    - [`exchangeAuthorizationCodeWithPkce`](https://developer.reachfive.com/sdk-core/exchangeAuthorizationCodeWithPkce.html)
    - [`loginWithCredentials`](https://developer.reachfive.com/sdk-core/loginWithCredentials.html)
    - [`loginWithPassword`](https://developer.reachfive.com/sdk-core/loginWithPassword.html)
    - [`loginWithWebAuthn`](https://developer.reachfive.com/sdk-core/loginWithWebAuthn.html)
    - [`signup`](https://developer.reachfive.com/sdk-core/signup.html)
- The following parameters `prompt`, `display` and `responseMode` of the `AuthOptions` model are now string unions.

## 1.15.0

### 07/07/2020

### Features

Add the optional `friendlyName` parameter to
the [addNewWebAuthnDevice](https://developer.reachfive.com/sdk-core/addNewWebAuthnDevice.html) method to set the
device's name.

## 1.14.0

### 07/02/2020

### Features

- Add a new method to fetch the profile
  data: [getSignupData](https://developer.reachfive.com/sdk-core/getSignupData.html).
- The error message thrown when the WebAuthn API is not available is updated.

## 1.14.0-beta.2

### 06/17/2020

### Features

Add new methods to allow management of FIDO2
devices: [listWebAuthnDevices](https://developer.reachfive.com/sdk-core/listWebAuthnDevices.html)
& [removeWebAuthnDevice](https://developer.reachfive.com/sdk-core/removeWebAuthnDevice.html).

### Fixes

Throw an error when the [Credentials Management API](https://caniuse.com/#feat=credential-management) is not available.

## 1.14.0-beta.1

### 06/15/2020

### Features

Add new methods to allow implementation of login with
biometrics: [addNewWebAuthnDevice](https://developer.reachfive.com/sdk-core/addNewWebAuthnDevice.html)
& [loginWithWebAuthn](https://developer.reachfive.com/sdk-core/loginWithWebAuthn.html).

## 1.13.0

### 05/18/2020

### Features

Add two new methods to request the verification of the phone number and email
address: [sendPhoneNumberVerification](https://developer.reachfive.com/sdk-core/sendPhoneNumberVerification.html)
& [sendEmailVerification](https://developer.reachfive.com/sdk-core/sendEmailVerification.html)

## 1.12.1

### 05/11/2020

### Fixes

Correct the signature of the [`verifyPasswordless`](https://developer.reachfive.com/sdk-core/verifyPasswordless.html)
method.

## 1.12.0

### 04/17/2020

### Features

Move the `persistent` parameter from
the [`loginWithPassword`](https://developer.reachfive.com/sdk-core/loginWithPassword.html) method to `AuthOptions`
payload object to make it available in every login method.

## 1.11.0

### 04/16/2020

### Features

Add the `persistent` parameter to
the [`loginWithPassword`](https://developer.reachfive.com/sdk-core/loginWithPassword.html) method to choose whether the
user session is persisted if the SSO feature is enabled.

## 1.10.0

### 02/05/2020

### Features

Add the `returnToAfterPasswordReset` parameter for reset password and the `returnToAfterEmailConfirmation` parameter for
signup.

## 1.9.3

### 01/07/2020

### Fixes

The [`logout`](https://developer.reach5.co/api/identity-web/#logout) method was fixed on Safari and IE11.

## 1.9.2

### 12/02/2019

### Fixes

Add the missing implementation of `Buffer` to address an issue with the UMD bundle when PKCE is enabled.

## 1.9.1

### 11/29/2019

### Fixes

- Open a webview for social login if the Cordova platform is iOS.
- Support compatibility with IE11.

## 1.9.0

### 10/28/2019

### Features

Support PKCE in login with password

## 1.8.0

### 10/21/2019

### Features

Export the remote settings and the `ErrorResponse` model.

## 1.7.1

### 09/19/2019

### Fixes

Customs fields and consents snake_case conversion

## 1.7.0

### 09/06/2019

### Features

The [Credentials Management API](https://www.w3.org/TR/credential-management/) is now supported for
the [signup]((https://developer.reach5.co/api/identity-web/#signup)).

### Fixes

Fix `redirectUrl` argument for [update email]((https://developer.reach5.co/api/identity-web/#updateemail)) function.

## 1.6.0

### 08/05/2019

### Features

- You can now redirect a profile to a specific URL
  after [signup]((https://developer.reach5.co/api/identity-web/#signup))
  or [profile update]((https://developer.reach5.co/api/identity-web/#updateprofile)) with the new `redirectUrl`
  argument.
- The [Credentials Management API](https://www.w3.org/TR/credential-management/) is now supported by the SDK. It will
  remove friction from sign-in flows by allowing users to be automatically signed back into a site even if their session
  has expired or they saved credentials on another device. Thus a
  new [`loginWithCredentials`](https://developer.reach5.co/api/identity-web/#loginWithCredentials) method was added and
  new arguments are passed to the [`loginWithPassword`](https://developer.reach5.co/api/identity-web/#loginwithpassword)
  and [`logout`](https://developer.reach5.co/api/identity-web/#logout) methods. However it's still an experimental
  feature, so check first your browser compatibility.

### Changes

The new default is to use the scopes defined for your client via the ReachFive console.

## 1.5.0

### 06/24/2019

### Features

Update the signature of the `loginWithSocialProvider` method to handle pkce support.

### Fixes

Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## 1.4.0

### 06/21/2019

### Features

- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.

## 1.3.0

### 06/11/2019

### Features

Update the signature of the `loginWithPassword` method to handle login with a phone number.

## 1.2.1

### 03/21/2019

#### Improvements

- Remove `validation.ts` library.
- Fix `tslint` warnings.

#### Minors breaking changes

Error messages changes for SDK configuration.

## 1.1.4

### 03/21/2019

#### Improvements

Automatise the deployment of a new release with `circleci`.

## 1.1.3

### 03/15/2019

#### Fixes and improvements

- Fix the typography of the `oldPassword` argument of the [`updatePassword`](src/main/apiClient.ts) method.
- Upgrade some dependencies.
- Implement `tslint`.
- Remove `yarn`.
