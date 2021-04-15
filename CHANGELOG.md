# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.20.1] - 2021-04-15

### Added

Added PKCE extra security in passwordless start flow.

### Changed

Remove Instagram related code as it is no longer a supported social provider.

### Fixes

Moved `cordova-plugin-inappbrowser` typings from devDependencies to dependencies.

## [1.20.0] - 2021-01-14

### Features

- Add an optional parameter `captchaToken` for captcha support in [loginWithPassword](https://developer.reachfive.com/sdk-core/loginWithPassword.html)

## [1.19.0] - 2020-12-10

### Features

- Only generate a `code_challenge` for **public** clients in authorization code flows.
- Hardcode to `response_type=token` for **confidential** clients in web message requests.

### Fixes

Refactor tests to cover a wider set of request permutations.

### Changed

Revamp of this changelog to follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0) guidelines.

## [1.18.1] - 2020-11-30

### Fixes

- The [loginWithSocialProvider](https://developer.reachfive.com/sdk-core/loginWithSocialProvider.html) method returns
  now the object reference from `InAppBrowser` within Cordova context.
- The `returnToAfterEmailConfirmation` parameter is added to
  the [signupWithWebAuthn](https://developer.reachfive.com/sdk-core/signupWithWebAuthn.html#params) method and allows to
  override the redirect URL specified in the *Signup* email template.
- The [verifyPasswordless](https://developer.reachfive.com/sdk-core/verifyPasswordless.html) method receives now
  correctly the `auth` options.

## [1.18.0] - 2020-10-30

### Features

- Generate a PKCE `code_challenge` by default in all authorization code flows (`responseType === 'code'`).
- Use the authorization code flow with PKCE in checkSession.

### Fixes

Rename erroneously named config value `pkceEnabled` to `pkceEnforced`.

## [1.17.2] - 2020-10-02

### Fixes

- Upgrade all dependencies.
- Fix IE/Edge window closing warning.

## [1.17.1] - 2020-09-15

### Fixes

Fix the CircleCi job to deploy a new version.

## [1.17.0] - 2020-09-14

### Features

Add a new method to signup with
WebAuthn: [signupWithWebAuthn](https://developer.reachfive.com/sdk-core/signupWithWebAuthn.html).

## [1.16.0] - 2020-09-10

### Features

- The `acceptTos` (Term Of Service) parameter in the `AuthOptions` was removed.
- The generic authentication callback was updated, it no longer calls the same endpoint.
- A new `AuthOptions` parameter `useWebMessage` was added to leverage web messages and redirectionless authentication.
- The following methods return now a `Promise<AuthResult>` instead of `Promise<void>`:
    - [exchangeAuthorizationCodeWithPkce](https://developer.reachfive.com/sdk-core/exchangeAuthorizationCodeWithPkce.html)
    - [loginWithCredentials](https://developer.reachfive.com/sdk-core/loginWithCredentials.html)
    - [loginWithPassword](https://developer.reachfive.com/sdk-core/loginWithPassword.html)
    - [loginWithWebAuthn](https://developer.reachfive.com/sdk-core/loginWithWebAuthn.html)
    - [signup](https://developer.reachfive.com/sdk-core/signup.html)
- The following parameters `prompt`, `display` and `responseMode` of the `AuthOptions` model are now string unions.

## [1.15.0] - 2020-07-07

### Features

Add the optional `friendlyName` parameter to
the [addNewWebAuthnDevice](https://developer.reachfive.com/sdk-core/addNewWebAuthnDevice.html) method to set the
device's name.

## [1.14.0] - 2020-07-02

### Features

- Add a new method to fetch the profile
  data: [getSignupData](https://developer.reachfive.com/sdk-core/getSignupData.html).
- The error message thrown when the WebAuthn API is not available is updated.

## [1.14.0-beta.2] - 2020-06-17

### Features

Add new methods to allow management of FIDO2
devices: [listWebAuthnDevices](https://developer.reachfive.com/sdk-core/listWebAuthnDevices.html)
& [removeWebAuthnDevice](https://developer.reachfive.com/sdk-core/removeWebAuthnDevice.html).

### Fixes

Throw an error when the [Credentials Management API](https://caniuse.com/#feat=credential-management) is not available.

## [1.14.0-beta.1] - 2020-06-15

### Features

Add new methods to allow implementation of login with
biometrics: [addNewWebAuthnDevice](https://developer.reachfive.com/sdk-core/addNewWebAuthnDevice.html)
& [loginWithWebAuthn](https://developer.reachfive.com/sdk-core/loginWithWebAuthn.html).

## [1.13.0] - 2020-05-18

### Features

Add two new methods to request the verification of the phone number and email
address: [sendPhoneNumberVerification](https://developer.reachfive.com/sdk-core/sendPhoneNumberVerification.html)
& [sendEmailVerification](https://developer.reachfive.com/sdk-core/sendEmailVerification.html)

## [1.12.1] - 2020-05-11

### Fixes

Correct the signature of the [verifyPasswordless](https://developer.reachfive.com/sdk-core/verifyPasswordless.html)
method.

## [1.12.0] - 2020-04-17

### Features

Move the `persistent` parameter from
the [loginWithPassword](https://developer.reachfive.com/sdk-core/loginWithPassword.html) method to `AuthOptions`
payload object to make it available in every login method.

## [1.11.0] - 2020-04-16

### Features

Add the `persistent` parameter to
the [loginWithPassword](https://developer.reachfive.com/sdk-core/loginWithPassword.html) method to choose whether the
user session is persisted if the SSO feature is enabled.

## [1.10.0] - 2020-02-05

### Features

Add the `returnToAfterPasswordReset` parameter for reset password and the `returnToAfterEmailConfirmation` parameter for
signup.

## [1.9.3] - 2020-01-07

### Fixes

The [logout](https://developer.reachfive.com/sdk-core/logout.html) method was fixed on Safari and IE11.

## [1.9.2] - 2019-12-02

### Fixes

Add the missing implementation of `Buffer` to address an issue with the UMD bundle when PKCE is enabled.

## [1.9.1] - 2019-11-29

### Fixes

- Open a webview for social login if the Cordova platform is iOS.
- Support compatibility with IE11.

## [1.9.0] - 2019-10-28

### Features

Support PKCE in login with password

## [1.8.0] - 2019-10-21

### Features

Export the remote settings and the `ErrorResponse` model.

## [1.7.1] - 2019-09-19

### Fixes

Customs fields and consents snake_case conversion

## [1.7.0] - 2019-09-06

### Features

The [Credentials Management API](https://www.w3.org/TR/credential-management) is now supported for
the [signup](https://developer.reachfive.com/sdk-core/signup.html).

### Fixes

Fix `redirectUrl` argument for [updateEmail](https://developer.reachfive.com/sdk-core/updateEmail.html) function.

## [1.6.0] - 2019-08-05

### Features

- You can now redirect a profile to a specific URL after [signup](https://developer.reachfive.com/sdk-core/signup.html)
  or [profileUpdate](https://developer.reachfive.com/sdk-core/updateProfile.html) with the new `redirectUrl`
  argument.
- The [Credentials Management API](https://www.w3.org/TR/credential-management) is now supported by the SDK. It will
  remove friction from sign-in flows by allowing users to be automatically signed back into a site even if their session
  has expired or they saved credentials on another device. Thus a
  new [loginWithCredentials](https://developer.reachfive.com/sdk-core/loginWithCredentials.html) method was added and
  new arguments are passed to the [loginWithPassword](https://developer.reachfive.com/sdk-core/loginWithPassword.html)
  and [logout](https://developer.reachfive.com/sdk-core/sdk-core/logout.html) methods. However it's still an
  experimental feature, so check first your browser compatibility.

### Changes

The new default is to use the scopes defined for your client via the ReachFive console.

## [1.5.0] - 2019-06-24

### Features

Update the signature of the `loginWithSocialProvider` method to handle pkce support.

### Fixes

Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## [1.4.0] - 2019-06-21

### Features

- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.

## [1.3.0] - 2019-06-11

### Features

Update the signature of the `loginWithPassword` method to handle login with a phone number.

## [1.2.1] - 2019-03-21

### Improvements

- Remove `validation.ts` library.
- Fix `tslint` warnings.
- Error messages changes for SDK configuration.

## [1.1.4] - 2019-03-21

### Improvements

Automatise the deployment of a new release with `circleci`.

## [1.1.3] - 2019-03-15

### Improvements

- Fix the typography of the `oldPassword` argument of
  the [updatePassword](https://developer.reachfive.com/sdk-core/updatePassword.html) method.
- Upgrade some dependencies.
- Implement `tslint`.
- Remove `yarn`.

[Unreleased]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.19.0...HEAD

[1.19.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.18.1...v1.19.0

[1.18.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.18.0...v1.18.1

[1.18.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.17.2...v1.18.0

[1.17.2]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.17.1...v1.17.2

[1.17.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.17.0...v1.17.1

[1.17.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.16.0...v1.17.0

[1.16.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.15.0...v1.16.0

[1.15.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.14.0...v1.15.0

[1.14.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.14.0-beta.2...v1.14.0

[1.14.0-beta.2]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.14.0-beta.1...v1.14.0-beta.2

[1.14.0-beta.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.13.0...v1.14.0-beta.1

[1.13.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.12.1...v1.13.0

[1.12.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.12.0...v1.12.1

[1.12.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.11.0...v1.12.0

[1.11.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.10.0...v1.11.0

[1.10.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.9.3...v1.10.0

[1.9.3]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.9.2...v1.9.3

[1.9.2]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.9.1...v1.9.2

[1.9.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.9.0...v1.9.1

[1.9.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.8.0...v1.9.0

[1.8.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.7.0...v1.8.0

[1.7.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.6.0...v1.7.0

[1.6.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.5.0...v1.6.0

[1.5.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.4.0...v1.5.0

[1.4.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.3.0...v1.4.0

[1.4.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.3.0...v1.4.0

[1.4.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.3.0...v1.4.0

[1.3.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.2.1...v1.3.0

[1.2.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.1.4...v1.2.1

[1.1.4]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.1.3...v1.1.4

[1.1.3]: https://github.com/ReachFive/identity-web-core-sdk/releases/tag/v1.1.3
