# Changelog

## v1.5.0

### 24 juin 2019

### Features
- Update the signature of the `loginWithSocialProvider` method to handle pkce support.

### Fixes
- Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## v1.4.0

### 21 juin 2019

### Features
- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.

## v1.3.0

### 11 juin 2019

### Features
- Update the signature of the `loginWithPassword` method to handle login with a phone number.

## v1.2.1

### 21 mars 2019

#### Improvements
- Remove validation.ts library
- Fix tslint warnings

#### Minors breaking changes
- Error messages changes for sdk configuration

## v1.1.4

### 21 mars 2019

#### Improvements

Automatise the deployment of a new release with `circleci`.

## v1.1.3

### 15 mars 2019

#### Fixes and improvements
- Fix the typography of the `oldPassword` argument of the [`updatePassword`](src/main/apiClient.ts) method.
- Upgrade some dependencies.
- Implement `tslint`.
- Remove `yarn`.
