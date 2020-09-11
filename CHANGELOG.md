# Changelog

## v.1.16.0

### 10/09/2020

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
  
## v.1.15.0

### 07/07/2020

### Features
Add the optional `friendlyName` parameter to the [addNewWebAuthnDevice](https://developer.reachfive.com/sdk-core/addNewWebAuthnDevice.html) method to set the device's name.

## v.1.14.0

### 02/07/2020

### Features
- Add a new method to fetch the profile data: [getSignupData](https://developer.reachfive.com/sdk-core/getSignupData.html).
- The error message thrown when the WebAuthn API is not available is updated.

## v.1.14.0-beta.2

### 17/06/2020

### Features
Add new methods to allow management of FIDO2 devices: [listWebAuthnDevices](https://developer.reachfive.com/sdk-core/listWebAuthnDevices.html) & [removeWebAuthnDevice](https://developer.reachfive.com/sdk-core/removeWebAuthnDevice.html).

### Fixes
Throw an error when the [Credentials Management API](https://caniuse.com/#feat=credential-management) is not available.

## v.1.14.0-beta.1

### 15/06/2020

### Features
Add new methods to allow implementation of login with biometrics: [addNewWebAuthnDevice](https://developer.reachfive.com/sdk-core/addNewWebAuthnDevice.html) & [loginWithWebAuthn](https://developer.reachfive.com/sdk-core/loginWithWebAuthn.html).

## v.1.13.0

### 18/05/2020

### Features
Add two new methods to request the verification of the phone number and email address: [sendPhoneNumberVerification](https://developer.reachfive.com/sdk-core/sendPhoneNumberVerification.html) & [sendEmailVerification](https://developer.reachfive.com/sdk-core/sendEmailVerification.html)

## v.1.12.1

### 11/05/2020

### Fixes
Correct the signature of the [`verifyPasswordless`](https://developer.reachfive.com/sdk-core/verifyPasswordless.html) method.

## v.1.12.0

### 17/04/2020

### Features
Move the `persistent` parameter from the [`loginWithPassword`](https://developer.reachfive.com/sdk-core/loginWithPassword.html) method to `AuthOptions` payload object to make it available in every login method.

## v.1.11.0

### 16/04/2020

### Features
Add the `persistent` parameter to the [`loginWithPassword`](https://developer.reachfive.com/sdk-core/loginWithPassword.html) method to choose whether the user session is persisted if the SSO feature is enabled.

## v.1.10.0

### 05/02/2020

### Features
Add the `returnToAfterPasswordReset` parameter for reset password and the `returnToAfterEmailConfirmation` parameter for signup.

## v.1.9.3

### 07/01/2020

### Fixes
The [`logout`](https://developer.reach5.co/api/identity-web/#logout) method was fixed on Safari and IE11.

## v.1.9.2

### 02/12/2019

### Fixes
Add the missing implementation of `Buffer` to address an issue with the UMD bundle when PKCE is enabled.

## v.1.9.1

### 29/11/2019

### Fixes
- Open a webview for social login if the Cordova platform is iOS.
- Support compatibility with IE11.
  
## v.1.9.0

### 28/10/2019

### Features
Support PKCE in login with password

## v.1.8.0

### 21/10/2019

### Features
Export the remote settings and the `ErrorResponse` model.

## v1.7.1

### 19/09/2019

### Fixes
Customs fields and consents snake_case conversion

## v1.7.0

### 06/09/2019

### Features
The [Credentials Management API](https://www.w3.org/TR/credential-management/) is now supported for the [signup]((https://developer.reach5.co/api/identity-web/#signup)).

### Fixes
Fix `redirectUrl` argument for [update email]((https://developer.reach5.co/api/identity-web/#updateemail)) function.

## v1.6.0

### 05/08/2019

### Features
- You can now redirect a profile to a specific URL after [signup]((https://developer.reach5.co/api/identity-web/#signup)) or [profile update]((https://developer.reach5.co/api/identity-web/#updateprofile)) with the new `redirectUrl` argument.
- The [Credentials Management API](https://www.w3.org/TR/credential-management/) is now supported by the SDK. It will remove friction from sign-in flows by allowing users to be automatically signed back into a site even if their session has expired or they saved credentials on another device. Thus a new [`loginWithCredentials`](https://developer.reach5.co/api/identity-web/#loginWithCredentials) method was added and new arguments are passed to the [`loginWithPassword`](https://developer.reach5.co/api/identity-web/#loginwithpassword) and [`logout`](https://developer.reach5.co/api/identity-web/#logout) methods.
  However it's still an experimental feature, so check first your browser compatibility.

### Changes
The new default is to use the scopes defined for your client via the ReachFive console.

## v1.5.0

### 24/06/2019

### Features
Update the signature of the `loginWithSocialProvider` method to handle pkce support.

### Fixes
Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## v1.4.0

### 21/06/2019

### Features
- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.

## v1.3.0

### 11/06/2019

### Features
Update the signature of the `loginWithPassword` method to handle login with a phone number.

## v1.2.1

### 21/03/2019

#### Improvements
- Remove `validation.ts` library.
- Fix `tslint` warnings.

#### Minors breaking changes
Error messages changes for SDK configuration.

## v1.1.4

### 21/03/2019

#### Improvements
Automatise the deployment of a new release with `circleci`.

## v1.1.3

### 15/03/2019

#### Fixes and improvements
- Fix the typography of the `oldPassword` argument of the [`updatePassword`](src/main/apiClient.ts) method.
- Upgrade some dependencies.
- Implement `tslint`.
- Remove `yarn`.
