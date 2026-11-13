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

   > **On-demand prereleases.** Comment `/rc` on the release pull request to publish a release candidate to npm
   > (`x.y.z-rc.1`, `x.y.z-rc.2`, …) under the `next` dist-tag. The pull request must carry the `release` label and
   > the comment must come from a repository member; CI reacts 🚀 to the comment when it picks the command up, runs the
   > same checks as a release, then posts the published version on the pull request. Install a candidate with
   > `npm install @reachfive/identity-core@<version>`. Prereleases are **never** tagged `latest`, so they cannot reach
   > consumers who track `latest`. The version in `package.json` must already be bumped (step 3) or the CI job fails:
   > an `x.y.z-rc.N` prerelease has lower precedence than an existing `x.y.z`.

5. Once the branch is merged into `master`, create and push the new tag.

    ```sh
    git tag <vx.y.z>
    git push origin <tag_name>
    ```

   The [Deploy Release](.github/workflows/deploy-release.yml) workflow runs on the tag: it runs the tests, builds,
   checks the package and publishes the new version of the SDK on
   [npm](https://www.npmjs.com/package/@reachfive/identity-core). See [npm publishing](#npm-publishing) for the
   setup it needs.

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

## Dist-tags

- `latest` — the current official release (what `npm install @reachfive/identity-core` resolves to). Only ever moved
  by an official release.
- `next` — the most recently published version, whether an official release or a prerelease. Use it to try the newest
  candidate: `npm install @reachfive/identity-core@next`.

Publishing an official release (tag push) moves **both** `latest` and `next` to it.

## npm publishing

The workflows publish with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC). The
repository stores no npm token. In the package settings on npmjs.com, a package owner declares one trusted publisher
(GitHub Actions, repository `ReachFive/identity-web-core-sdk`) for each workflow:

| Workflow | Publishes | Allowed actions |
|---|---|---|
| `deploy-release.yml` | official releases, then moves `next` | `npm publish` and `npm dist-tag` |
| `ci.yml` | release candidates (`/rc`) | `npm publish` |

`npm dist-tag` with OIDC needs npm 11.21.0 or later: `deploy-release.yml` installs it before publishing.
