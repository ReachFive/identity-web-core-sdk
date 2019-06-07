# Changelog

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