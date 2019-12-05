# Changelog

## 0.1.0-alpha.22

### 05/12/2019

### Fixes
- Snake_case transformation for consents and custom fields.

## 0.1.0-alpha.21

### 29/11/2019

### Fixes
- Open a webview for social login if the Cordova platform is iOS.

## 0.1.0-alpha.20

### 06/08/2019

### Fixes
- The `lodash` dependency was temporary downgraded since it broke tests.

## 0.1.0-alpha.19

### 05/08/2019

## Features
- You can now redirect a profile to a specific URL after [signup](https://developer.reach5.co/api/identity-web-legacy/#signup) or [profile update](https://developer.reach5.co/api/identity-web-legacy/#updateprofile) with the new `redirectUrl` argument.

## 0.1.0-alpha.18

### 25/07/2019

## Changes
- The new default is to use the scopes defined for your client via the ReachFive console.

## 0.1.0-alpha.17

### 24/06/2019

### Fixes
- Pass auth options `scope` used by `loginWithPassword` and `signup` to the Identity API calls.

## 0.1.0-alpha.16

### 21/06/2019

### Features
- Update the signature of the `requestPasswordReset` method to handle a custom redirect url on the email sent.
- Update the signature of the `requestPasswordReset` method to handle request password with a phone number.
- Update the signature of the `updatePassword` method to handle update password with a phone number.
- Update the signature of the `loginWithSocialProvider` method to handle pkce support.

## 0.1.0-alpha.15

### 07/06/2019

### Features
- Update the signature of the `loginWithPassword` method to handle login with a phone number.

## 0.1.0-alpha.14

### 18/03/2019

#### Fixes
- Fix the typography of the `oldPassword` argument of the [`updatePassword`](src/main/apiClient.ts) method.
- Update the `ts-jest` config to fix tests on circleci.

### Features
- Add a [circleci configuration file](.circle/config.yml) to automatize the release of the _legacy_ version on npm.
