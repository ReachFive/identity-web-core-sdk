/**
 * Computes the version of an on-demand release candidate (`/rc` on a release pull request).
 *
 * Usage: npm view <pkg> versions --json | node scripts/prerelease-version.mjs <baseVersion>
 * Prints "<baseVersion>-rc.<N>" to stdout. Exits 1 (message on stderr) when the
 * base version is already published or when no base version is supplied.
 */
import { text } from 'node:stream/consumers'
import { fileURLToPath } from 'node:url'

/**
 * Normalise the output of `npm view <pkg> versions --json`.
 * npm prints a JSON array when multiple versions exist, a bare JSON string
 * when exactly one exists, and nothing when the package is unpublished.
 */
export function parseVersionsJson(jsonText) {
  if (!jsonText || jsonText.trim() === '') return []
  const parsed = JSON.parse(jsonText)
  if (Array.isArray(parsed)) return parsed
  if (typeof parsed === 'string') return [parsed]
  return []
}

/**
 * Compare two plain `x.y.z` release versions numerically, per component.
 * Returns a negative number if `a` < `b`, positive if `a` > `b`, 0 if equal.
 */
function compareReleaseVersions(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0)
    if (diff !== 0) return diff < 0 ? -1 : 1
  }
  return 0
}

/**
 * Guard: a `<base>-rc.N` prerelease has LOWER semver precedence than `<base>`,
 * so publishing one only makes sense while `<base>` itself is unreleased AND
 * greater than every release already published. Otherwise the `next` dist-tag
 * would move backward to a version with lower semver precedence than the
 * current releases.
 * Throws when the base version is not strictly greater than the highest
 * published release version (i.e. someone opened a release PR without
 * bumping the version far enough).
 */
export function assertBaseVersionPublishable(baseVersion, publishedVersions) {
  const publishedReleases = publishedVersions.filter((version) => /^\d+\.\d+\.\d+$/.test(version))
  if (publishedReleases.length === 0) return

  const maxRelease = publishedReleases.reduce((max, version) =>
    compareReleaseVersions(version, max) > 0 ? version : max
  )

  if (compareReleaseVersions(baseVersion, maxRelease) <= 0) {
    throw new Error(
      `Version ${baseVersion} is not greater than the latest published release ${maxRelease}. ` +
        `Bump the version in package.json before opening/updating a release PR (see RELEASE.md).`
    )
  }
}

/**
 * Compute the next iterative release-candidate version for `baseVersion`.
 * e.g. base "2.0.2" with existing "2.0.2-rc.1","2.0.2-rc.2" -> "2.0.2-rc.3".
 * Returns "<base>-rc.1" when no matching prerelease exists yet.
 */
export function computeNextRcVersion(baseVersion, publishedVersions) {
  const prefix = `${baseVersion}-rc.`
  let maxN = 0
  for (const version of publishedVersions) {
    if (!version.startsWith(prefix)) continue
    const suffix = version.slice(prefix.length)
    if (/^\d+$/.test(suffix)) {
      const n = Number.parseInt(suffix, 10)
      if (n > maxN) maxN = n
    }
  }
  return `${baseVersion}-rc.${maxN + 1}`
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isMain) {
  const baseVersion = process.argv[2]
  if (!baseVersion) {
    console.error('Usage: <versions-json-on-stdin> | node scripts/prerelease-version.mjs <baseVersion>')
    process.exit(1)
  }
  // Read as a stream: a synchronous read of fd 0 fails with EAGAIN when stdin is a non-blocking pipe.
  const stdin = process.stdin.isTTY ? '' : await text(process.stdin)
  const versions = parseVersionsJson(stdin)
  try {
    assertBaseVersionPublishable(baseVersion, versions)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  process.stdout.write(computeNextRcVersion(baseVersion, versions))
}
