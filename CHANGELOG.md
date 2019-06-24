# Changelog

## 0.1.0-alpha.17

### 21 juin 2019

### Fixes
- Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## 0.1.0-alpha.16

### 21 juin 2019

### Features
- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.
- Update the signature of the `loginWithSocialProvider` method to handle pkce support.

## 0.1.0-alpha.15

### 07 juin 2019

### Features
- Update the signature of the `loginWithPassword` method to handle login with a phone number.

## 0.1.0-alpha.14

### 18 mars 2019

#### Fixes
- Fix the typography of the `oldPassword` argument of the [`updatePassword`](src/main/apiClient.ts) method.
- Update the `ts-jest` config to fix tests on circleci.

### Features
- Add a [circleci configuration file](.circle/config.yml) to automatize the release of the _legacy_ version on npm.
