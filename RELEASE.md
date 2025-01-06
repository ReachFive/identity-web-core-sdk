# Publication guide

1. Start a new release branch.

    ```sh
    git checkout -b release/vx.y.z
    ```

2. Describe the new features and the fixes in the [CHANGELOG.md](CHANGELOG.md) file.

3. Update the package's version with the command line below. It should respect the [semver](https://semver.org)
   versioning.

    ```sh
    npm --no-git-tag-version version [<newversion> | major | minor | patch]
    ```

   This commands will update the version in the [package.json](package.json) and [package-lock.json](package-lock.json)
   files.

   Commit and push the branch with the new version.

    ```sh
    git commit -am "vx.y.z"
    git push --set-upstream origin HEAD
    ```

4. Create a pull request named `Release vx.y.z` (add the Github tag `release`) and submit it.

5. Once the branch is merged into `master`, create and push the new tag.

    ```sh
    git tag <vx.y.z>
    git push origin <tag_name>
    ```

   [circleci](https://circleci.com) will automatically trigger a build, run the tests and publish the new version of the
   SDK on [npm](https://www.npmjs.com/package/@reachfive/identity-core).

   > It's important to push the tag separately otherwise the [deployement job is not triggered](https://support.circleci.com/hc/en-us/articles/115013854347-Jobs-builds-not-triggered-when-pushing-tag).

   Refer to the [.circleci/config.yml](.circleci/config.yml) file to set up the integration.

6. Purge the cache of a @latest or version aliased URL to force users to get the new updated version. Otherwise they might wait up to 7 days.

   Copy and submit the following URLS in the [Purge jsDelivr CDN cache](https://www.jsdelivr.com/tools/purge) form.

   ```
   https://cdn.jsdelivr.net/npm/@reachfive/identity-core@latest/es/main.js
   https://cdn.jsdelivr.net/npm/@reachfive/identity-core@latest/cjs/main.js
   https://cdn.jsdelivr.net/npm/@reachfive/identity-core@latest/umd/identity-core.js
   https://cdn.jsdelivr.net/npm/@reachfive/identity-core@latest/umd/identity-core.min.js
   ```

7. Draft a new release in the [Github releases tab](https://github.com/ReachFive/identity-web-core-sdk/releases) (
   copy/paste the changelog in the release's description).