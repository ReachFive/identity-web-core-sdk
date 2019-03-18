# Changelog

## 0.1.0-alpha.14

### 18 Mars 2019

#### Fixes
- Fix the typography of the `oldPassword` argument of the [`updatePassword`](src/main/apiClient.ts) method.
- Update the `ts-jest` config to fix tests on circleci.

### Features
- Add a [circleci configuration file](.circle/config.yml) to automatize the release of the _legacy_ version on npm.