# Guide for publication

1. Describe the new features and bug fixes in the [CHANGELOG.md](CHANGELOG.md).

2. Update the package's version with the command line below. It should respect the [semver](https://semver.org/) versioning.

    ```sh
    npm version [<newversion> | major | minor | patch]
    ```

    If you want to release an _alpha_ version, launch: 

    ```sh
    npm version prerelease --preid=alpha
    ```

    This commands will update the version in the [`package.json`](package.json) file and will create a new tag (eg: `v1.1.3`).

3. Push the new tag and the two latest commits.
   
    ```sh
    git push --follow-tags
    ```

    [circleci](https://circleci.com/) will automatically trigger a build, run the tests and publish the new version of the SDK on [`npm`](https://www.npmjs.com/package/@reachfive/identity-core).

    Refer to the [.circleci/config.yml](.circleci/config.yml) file to set up the integration.