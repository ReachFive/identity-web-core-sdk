# Changelog

## v.1.9.2

### 02/12/2019

### Fixes
- Add the missing implementation of `Buffer` to address an issue with the UMD bundle when PKCE is enabled.

## v.1.9.1

### 29/11/2019

### Fixes
- Open a webview for social login if the Cordova platform is iOS.
- Support compatibility with IE11.
  
## v.1.9.0

### 28/10/2019

### Features
- Support PKCE in login with password

## v.1.8.0

### 21/10/2019

### Features
- Export the remote settings and the `ErrorResponse` model.

## v1.7.1

### 19/09/2019

### Fixes
- Customs fields and consents snake_case conversion

## v1.7.0

### 06/09/2019

### Features
- The [Credentials Management API](https://www.w3.org/TR/credential-management/) is now supported for the [signup]((https://developer.reach5.co/api/identity-web/#signup)).

### Fixes
- Fix `redirectUrl` argument for [update email]((https://developer.reach5.co/api/identity-web/#updateemail)) function.

## v1.6.0

### 05/08/2019

### Features
- You can now redirect a profile to a specific URL after [signup]((https://developer.reach5.co/api/identity-web/#signup)) or [profile update]((https://developer.reach5.co/api/identity-web/#updateprofile)) with the new `redirectUrl` argument.
- The [Credentials Management API](https://www.w3.org/TR/credential-management/) is now supported by the SDK. It will remove friction from sign-in flows by allowing users to be automatically signed back into a site even if their session has expired or they saved credentials on another device. Thus a new [`loginWithCredentials`](https://developer.reach5.co/api/identity-web/#loginWithCredentials) method was added and new arguments are passed to the [`loginWithPassword`](https://developer.reach5.co/api/identity-web/#loginwithpassword) and [`logout`](https://developer.reach5.co/api/identity-web/#logout) methods.
  However it's still an experimental feature, so check first your browser compatibility.

### Changes
- The new default is to use the scopes defined for your client via the ReachFive console.

## v1.5.0

### 24/06/2019

### Features
- Update the signature of the `loginWithSocialProvider` method to handle pkce support.

### Fixes
- Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## v1.4.0

### 21/06/2019

### Features
- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.

## v1.3.0

### 11/06/2019

### Features
- Update the signature of the `loginWithPassword` method to handle login with a phone number.

## v1.2.1

### 21/03/2019

#### Improvements
- Remove validation.ts library
- Fix tslint warnings

#### Minors breaking changes
- Error messages changes for sdk configuration

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
