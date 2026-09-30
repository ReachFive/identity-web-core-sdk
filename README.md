[![CircleCI](https://circleci.com/gh/ReachFive/identity-web-core-sdk/tree/master.svg?style=svg)](https://circleci.com/gh/ReachFive/identity-web-core-sdk/tree/master) [![npm](https://img.shields.io/npm/v/@reachfive/identity-core.svg?color=blue)](https://www.npmjs.com/package/@reachfive/identity-core)

# ReachFive Identity Web Core SDK

## Installation

The following command installs the Identity Web Core SDK as a Node.js dependency:

```sh
npm install --save @reachfive/identity-core
```

## Upgrading

### `ProfileAddress.isDefault` is now `default`

The API has always named an address's default flag `default`: it never read `isDefault`, which the SDK sent as
`is_default`, and never returned it. So `isDefault` is gone from `ProfileAddress`, and code that still uses it
no longer compiles. Rename it to `default` in the data given to `signup`, `updateProfile`, `startPasswordless`
and `signupWithWebAuthn`, and when reading the addresses of a profile.

```diff
- addresses: [{ streetAddress: '1 rue X', isDefault: true }]
+ addresses: [{ streetAddress: '1 rue X', default: true }]
```

## Documentation

You'll find the documentation of the methods exposed [here](https://developer.reachfive.com/sdk-core/index.html).

## Changelog

Please refer to [changelog](CHANGELOG.md) to learn about release notes.

## License

MIT © [ReachFive](https://www.reachfive.com)
