# Guide for publication

1. Create a pull request named `Release vx.y.z` (add the Github tag `release`).

2. Describe the new features and the bug fixes in the [CHANGELOG.md](CHANGELOG.md) file.

3. Update the package's version with the command line below. It should respect the [semver](https://semver.org/) versioning.

    ```sh
    npm --no-git-tag-version version [<newversion> | major | minor | patch]
    ```

    If you want to release an _alpha_ version, launch: 

    ```sh
    npm version --no-git-tag-version prerelease --preid=alpha
    ```

    This commands will update the version in the [`package.json`](package.json) file. 

    Commit and push the change with the version.

    ```sh
    git add .
    git commit -m "vx.y.z"
    ```

4. Submit your pull request.

5. Once the branch is merged into `master`, create the new tag.
   
    ```sh
    git tag <vx.y.z> 
    git push origin <tag_name> 
    ```

    [circleci](https://circleci.com/) will automatically trigger a build, run the tests and publish the new version of the SDK on [`npm`](https://www.npmjs.com/package/@reachfive/identity-core).
    
    > It's important to push the tag separately otherwise the deployement job is not triggered (https://support.circleci.com/hc/en-us/articles/115013854347-Jobs-builds-not-triggered-when-pushing-tag).

    Refer to the [.circleci/config.yml](.circleci/config.yml) file to set up the integration.

6.  Finally, create a new release in the [Github releases tab](https://github.com/ReachFive/identity-web-core-sdk/releases) (copy/past the changelog in the release's description).