# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `IdTokenPayload`, `IdTokenAddress` and `Gender` are now exported from the entry point.
  `AuthResult.idTokenPayload` has always been typed with them, but they were never exported, so
  consumers could not name a type they were already being handed.
- `IdTokenPayload` inherits the RFC 7519 registered claims from jose, which adds `jti` and `nbf`. Only
  the registered claims are inherited, not `JWTPayload` wholesale: that interface carries an index
  signature, and inheriting it would turn every mistyped claim access into a silent `unknown` rather
  than a compile error.
- Tests for `utils/jwt.ts` and `main/webAuthnService.ts`, neither of which was covered. The WebAuthn
  ones pin the wire format against the CIAM backend's `Base64.getUrlEncoder` / `getUrlDecoder`
  contract, with fixtures whose standard-base64 form contains both `+` and `/` so an alphabet mistake
  cannot pass.
- `npm run typecheck`, `npm run typecheck:api`, `npm run clean` and `npm run smoke:umd`.

### Changed
- **Bundle size.** Gzipped, against 1.42.0: `es/main.js` and `cjs/main.js` go **172 kB → 15 kB (−91%)**,
  `umd/identity-core.min.js` goes **91 kB → 15 kB (−83%)**. Three causes: `core-js` is no longer
  bundled, the `es`/`cjs` bundles no longer inline runtime polyfills, and the `buffer` polyfill is gone.
- **Build**: migrated to Rollup 4 with the official `@rollup/plugin-*` plugins, replacing Rollup 2 and
  the deprecated `rollup-plugin-babel` / `-commonjs` / `-node-resolve` / `-typescript2`. Babel is gone:
  it never transpiled the SDK's own TypeScript, since its default extension filter excludes `.ts`, so
  the emitted syntax was, and still is, decided by `tsc` alone.
- **Type declarations** are bundled into a single `es/main.d.ts` rather than a tree of per-file
  declarations, which also stops publishing declarations for test files and stale artefacts.
- `tsc` target raised from `ES6` to `ES2020` for the `es`/`cjs` bundles; the UMD bundle stays on `ES2015`.
- **Prettier upgraded from 2.1.2 to 3.x.** The pinned 2020 release could not parse the codebase's own
  syntax — the `satisfies` operator in `oAuthClient.ts` and the template-literal type in `utils.ts` both
  threw `SyntaxError` — which is why the `format:check` CI step had been commented out. `format` and
  `format:check` now cover the whole repository (see `.prettierignore`) instead of only `src/**/*.ts`,
  and the CI step is enabled. The resulting reformat is stylistic only.

### Fixed
- The published type declarations referenced `InAppBrowser` from `@types/cordova-plugin-inappbrowser`,
  which was a dev dependency — so consumers could never resolve it and type-checking the SDK's public
  API failed. That package is now a runtime dependency.

### Removed
- `core-js` and `regenerator-runtime` are no longer bundled. They polyfilled nothing the SDK needs: the
  most modern built-in used in the source is `Object.fromEntries` (ES2019), whereas the SDK's floor is
  Chrome 92 / Safari 15.4 because of `crypto.subtle` (PKCE, One Tap nonce) and `crypto.randomUUID`
  (correlation id), which no polyfill can provide. Despite Babel targeting `ie: 11`, IE11 was never
  actually supported. `fetch` is still polyfilled in the UMD bundle.

  If your application relied on the polyfills the SDK happened to inline, import them yourself
  according to your own browser targets.
- The `buffer` polyfill dependency, pinned at 5.6.0 from 2020. It was inlined into the `es`/`cjs`
  bundles because the externals predicate matched `buffer` while the code imported `buffer/`.
- Deep imports into the package internals, for example `@reachfive/identity-core/es/utils/jwt`. Only the
  documented entry points are supported.

### Internal
- Hand-rolled crypto and base64 primitives replaced by [`jose`](https://github.com/panva/jose):
  `utils/base64.ts` deleted, `utils/jwt.ts` delegates to `decodeJwt`, and `utils/random.ts`,
  `main/pkceService.ts`, `main/webAuthnService.ts` and the Google One Tap nonce use `jose.base64url`
  plus Web Crypto. Outputs verified byte-identical to the previous implementation over 12 600 random
  cases. WebAuthn decoding normalises alphabet and padding itself, so tolerance is a property of the
  SDK rather than of the installed base64 implementation.
- `main/models.ts` (469 lines, opening with a literal `// TODO: To sort`) split into ten focused modules
  under `api/models/`, grouped by aggregate: profile, signup, session, tokens, mfa, password,
  customFields, consents, settings, errors. Every type is still re-exported from the entry point.
- `tsconfig.api.json` and `npm run typecheck:api` add a purity guard that compiles `src/api` with no DOM
  libs and no ambient `@types`, so a browser global reaching the isomorphic layer fails the build. The
  root tsconfig cannot catch this — it has `DOM` in `lib` for the whole project. Wired into CI.
- `Config` and `ApiClientConfig` moved out of `main.ts` into `main/config.ts`. All four sub-clients
  imported `ApiClientConfig` from the very module that constructs them, putting each of them in an
  import cycle; those cycles are gone. Both types are still re-exported from the entry point.
- All type-only imports are written as `import type`, enforced by
  `@typescript-eslint/consistent-type-imports`. They are erased at compile time, so marking them keeps
  the module graph readable — a reviewer can see which imports create a runtime edge — and stops a
  type-only reference from quietly reintroducing a cycle. The emitted JavaScript is byte-identical.
- `@typescript-eslint/no-namespace` is no longer disabled project-wide. The four namespaces that must
  stay — the public `ErrorResponse`, `MFA` and `AuthResult` merged namespaces, plus the Jest matcher
  augmentation — carry a scoped exemption with the reason, so any *new* namespace is reported.
- Dead code with no callers removed: `src/utils/obj.ts`, which also shadowed the global `Set`, plus
  `encodeBase64UrlSafe`, `parseQueryString`, `snakeCasePath`, `camelCasePath`, `log` and `logWarn`.

  None was part of the consumable API despite living in exported modules. `src/` is not published
  (`files` lists only `cjs`, `es` and `umd`), and all five symbols appear **zero** times in the
  published bundles because Rollup already tree-shook them. A deep import such as
  `@reachfive/identity-core/es/utils/queryString` would have type-checked against the per-file
  declarations that used to be published, then failed at runtime: there was no matching `.js` file.
- `WebAuthnClient`'s constructor re-assigned six endpoint URLs to the values its field initialisers had
  already set, while silently omitting the two reset-passkeys ones. Removed.
- Unresolved imports fail the build, as do import cycles involving the SDK's own sources. Cycles inside
  dependencies remain warnings, since they are common and outside our control.
- `jest.setup.ts` provides `TextEncoder` / `TextDecoder`, which jsdom 19 does not expose, and jsdom's
  export conditions ask for `node` so packages shipping separate ESM browser builds resolve to their
  CommonJS entry point under ts-jest.

## [1.42.0] - 2026-08-20

### Add
- Optional `state` parameter in the `logout` method, returned as-is in the query string of the redirect URL

### Changed
- method verifyPasswordless redirect to GET passwordless/verify in orchestrated flow
- method verifyPasswordless does not forward AuthParameters to GET passwordless/verify in orchestrated flow

## [1.41.0] - 2026-03-26

### Changed
- method verifyMfaPasswordless redirect to GET passwordless/verify in orchestrated flow
- method verifyMfaPasswordless does not redirect with an error when the verification code is invalid

## [1.40.0] - 2026-02-12

### Add
- LoginTypeAllowed in RemoteSettings
- Support PKCE Code Challenge + Code Challenge Method overriding in methods using PKCE

### Changed
- No PKCE is generated in method getMfaStepUp when flow is orchestrated
- Avoid to automatically exchange authentication code when useWebMessage is true and the client is private

## [1.39.0] - 2025-09-30

### Add
- support blocking login during signup when no identifier is verified
- support correlation id

## [1.38.0] - 2025-08-29

### Add
- support orchestration flow for step up

## [1.37.1] - 2025-07-17

### Fix
- release lock after verifyMfaPasswordless

## [1.37.0] - 2025-07-09

### Added
- Added CaptchaFox support.
- Added parameter action to getMfaStepUpToken, startMfaPhoneNumberRegistration, startMfaEmailRegistration, loginWithPassword.

## [1.36.0] - 2025-04-24

### Added
- Allow to trust a device during a mfa credential registering

### Changed
- Add cookies forwarding in every method

## [1.35.4] - 2025-02-27

### Fixed

- Restore cookies forwarding in loginWithPassword (after fixed on API)

## [1.35.3] - 2025-02-19

### Fixed

- Revert previous changes

## [1.35.2] - 2025-02-19

### Fixed

- Forward cookies (especially RBA trusted device) in loginWithPassword

## [1.35.1] - 2025-02-05

### Changed

- Add clientId to getPasswordStrength request body

## [1.35.0] - 2025-02-04

### Added

- add method verifyEmail
- add method getPasswordStrength

### Changed

- Replace Lodash methods with custom integration
- Add missing errorMessageKey in ErrorResponse type

## [1.34.2] - 2025-01-29

### Added

- Add `credentials: 'include'` to passwordless verification call if SSO is enabled

### Fixed

- `loginWithPopup` should return resolved/rejected promise

## [1.34.1] - 2025-01-07

### Changed

- verifyPasswordless should not make redirection with useWebMessage by using POST method endpoint.

## [1.34.0] - 2024-11-07

### Added

- Add support for passkey additional information.
- Allow specifying Google variant to use with One Tap.

### Fixed

- Use local storage instead of session storage for code verifier.

## [1.33.0] - 2024-05-16

### Added

- Add support for account recovery and passkey reset
- Make WebAuthn origin configurable

## [1.32.2] - 2024-03-21

### Added

- Add support for discoverable passkey login

## [1.32.1] - 2024-01-18

### Fixed

- Fix never resolved promise in verifyPasswordless with useWebMessage

### Added

- Address custom field support

## [1.32.0] - 2024-01-05

### Added

- Add locale variable

## [1.31.0] - 2023-12-21

### Changed

- Modify verifyPasswordless signature (adding AuthOptions)

## [1.30.1] - 2023-11-09

### Changed

- Make profile properties optionals in updateProfile's data param type

## [1.30.0] - 2023-11-07

### Changed

- Remove unnecessary access token parameter from verifyMfaPasswordless method

## [1.29.1] - 2023-10-16

### Fixed

- Fix issue occurring when checkSession is called less than 20 seconds after another checkSession during no PKCE flow.

## [1.29.0] - 2023-10-06

### Added

- Added method listTrustedDevices
- Added method deleteTrustedDevices

## [1.28.0] - 2023-09-13

### Fixed

- Fix error occuring when checkSession is called quickly after another checkSession
- Fix error occuring when loginFromSession is called quickly after another loginFromSession

## [1.27.0] - 2023-08-01

### Added

- Added an optional parameter `trustDevice` in the `verifyMfaPasswordless` function
- Added `addressComplement` field in the `ProfileAddress` model.
- Added `rbaEnabled` field in `RemoteSettings` model.
- Added and optional parameter `returnProviderToken` in `TokenRequestParameters` and returns `providerAccessToken` and `providerName` fields in `AuthResult` if `returnProviderToken` is set to `true`.
- Added an optional parameter `captchaToken` for captcha support in [updateEmail](https://developer.reachfive.com/sdk-core/updateEmail.html).

### Fixed

- Fix error occurring when checkSession is called quickly after a loginWithPassword

## [1.26.0] - 2022-11-17

### Added

- Initiate an MFA step-up challenge in loginWithPassword when the mfa verification is required
- Added an optional parameter in the `logout` function to revoke tokens

## [1.25.0] - 2022-09-22

### Added

- Support authentication with the field `custom_identifier`
- Field `custom_identifier` is now allowed during signup

## [1.24.1] - 2022-08-03

### Fixed

Fix parameter in web messages.

## [1.24.0] - 2022-07-25

### Added

Support for orchestrated flows.

## [1.23.0] - 2022-06-15

### Added

Google One Tap instantiation method.

### Changed

Align `startMfaPhoneNumberRegistration` response on the `startMfaEmailRegistration` one.

### Removed

A deprecated legacy endpoint limited to a specific customer has been removed for security reasons.

## [1.22.0] - 2022-02-22

### Added 

- Introduce `verifyMfaPasswordless` to complete an MFA passwordless flow
- Add new 2nd factor email identifier management functions:
  - `verifyMfaEmailRegistration`
  - `startMfaEmailRegistration`
  - `removeMfaEmail`
- Add an optional parameter `captchaToken` for captcha support in [signup](https://developer.reachfive.com/sdk-core/signup.html),
[startPasswordless](https://developer.reachfive.com/sdk-core/startPasswordless.html)
and [requestPasswordReset](https://developer.reachfive.com/sdk-core/requestPasswordReset.html)

### Changed

Support the step up from a fresh access token with function `getMfaStepUpToken`

## [1.21.1] - 2021-11-30

### Added 

Add possibility to refresh access token with a refresh token

## [1.21.0] - 2021-07-30

### Features

- Initiate an MFA step-up challenge
- List registered MFA credentials
- Add or remove MFA phone number credential

### Changed

- `startPasswordless` can now can take a MFA step-up token to initiate a second factor challenge
- `startPasswordless` now returns an MFA challenge ID when using in step-up flows
- `verifyPasswordless` refactored to be able to complete second factor challenges

## [1.20.1] - 2021-04-15

### Added

Added PKCE extra security in passwordless start flow.

### Changed

Remove Instagram related code as it is no longer a supported social provider.

### Fixed

Moved `cordova-plugin-inappbrowser` typings from devDependencies to dependencies.

## [1.20.0] - 2021-01-14

### Features

- Add an optional parameter `captchaToken` for captcha support in [loginWithPassword](https://developer.reachfive.com/sdk-core/loginWithPassword.html)

## [1.19.0] - 2020-12-10

### Features

- Only generate a `code_challenge` for **public** clients in authorization code flows.
- Hardcode to `response_type=token` for **confidential** clients in web message requests.

### Fixed

Refactor tests to cover a wider set of request permutations.

### Changed

Revamp of this changelog to follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0) guidelines.

## [1.18.1] - 2020-11-30

### Fixed

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

### Fixed

Rename erroneously named config value `pkceEnabled` to `pkceEnforced`.

## [1.17.2] - 2020-10-02

### Fixed

- Upgrade all dependencies.
- Fix IE/Edge window closing warning.

## [1.17.1] - 2020-09-15

### Fixed

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

### Fixed

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

### Fixed

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

### Fixed

The [logout](https://developer.reachfive.com/sdk-core/logout.html) method was fixed on Safari and IE11.

## [1.9.2] - 2019-12-02

### Fixed

Add the missing implementation of `Buffer` to address an issue with the UMD bundle when PKCE is enabled.

## [1.9.1] - 2019-11-29

### Fixed

- Open a webview for social login if the Cordova platform is iOS.
- Support compatibility with IE11.

## [1.9.0] - 2019-10-28

### Features

Support PKCE in login with password

## [1.8.0] - 2019-10-21

### Features

Export the remote settings and the `ErrorResponse` model.

## [1.7.1] - 2019-09-19

### Fixed

Customs fields and consents snake_case conversion

## [1.7.0] - 2019-09-06

### Features

The [Credentials Management API](https://www.w3.org/TR/credential-management) is now supported for
the [signup](https://developer.reachfive.com/sdk-core/signup.html).

### Fixed

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

### Fixed

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

[Unreleased]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.42.0...HEAD

[1.42.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.41.0...v1.42.0

[1.41.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.40.0...v1.41.0

[1.40.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.39.0...v1.40.0

[1.39.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.38.0...v1.39.0

[1.38.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.37.1...v1.38.0

[1.37.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.37.0...v1.37.1

[1.37.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.36.0...v1.37.0

[1.36.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.35.4...v1.36.0

[1.35.4]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.35.3...v1.35.4

[1.35.3]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.35.2...v1.35.3

[1.35.2]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.35.1...v1.35.2

[1.35.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.35.0...v1.35.1

[1.35.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.34.2...v1.35.0

[1.34.2]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.34.1...v1.34.2

[1.34.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.34.0...v1.34.1

[1.34.0]:https://github.com/ReachFive/identity-web-core-sdk/compare/v1.33.0...v1.34.0

[1.33.0]:https://github.com/ReachFive/identity-web-core-sdk/compare/v1.32.2...v1.33.0

[1.32.2]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.32.1...v1.32.2

[1.32.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.32.0...v1.32.1

[1.32.0]:https://github.com/ReachFive/identity-web-core-sdk/compare/v1.31.0...v1.32.0

[1.31.0]:https://github.com/ReachFive/identity-web-core-sdk/compare/v1.30.1...v1.31.0

[1.30.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.30.0...v1.30.1

[1.30.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.29.1...v1.30.0

[1.29.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.29.0...v1.29.1

[1.29.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.28.0...v1.29.0

[1.28.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.27.0...v1.28.0

[1.27.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.26.0...v1.27.0

[1.26.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.25.0...v1.26.0

[1.25.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.24.1...v1.25.0

[1.24.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.24.0...v1.24.1

[1.24.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.23.0...v1.24.0

[1.23.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.22.0...v1.23.0

[1.22.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.21.1...v1.22.0

[1.21.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.21.0...v1.21.1

[1.21.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.20.1...v1.21.0

[1.20.1]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.20.0...v1.20.1

[1.20.0]: https://github.com/ReachFive/identity-web-core-sdk/compare/v1.19.0...v1.20.0

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
