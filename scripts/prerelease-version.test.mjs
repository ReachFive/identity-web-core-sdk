import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { parseVersionsJson, assertBaseVersionPublishable, computeNextRcVersion } from './prerelease-version.mjs'

test('parseVersionsJson handles a JSON array', () => {
  assert.deepEqual(parseVersionsJson('["1.0.0","1.0.1"]'), ['1.0.0', '1.0.1'])
})

test('parseVersionsJson wraps a single bare string (npm one-version form)', () => {
  assert.deepEqual(parseVersionsJson('"1.0.0"'), ['1.0.0'])
})

test('parseVersionsJson returns [] for empty/blank input', () => {
  assert.deepEqual(parseVersionsJson(''), [])
  assert.deepEqual(parseVersionsJson('   '), [])
})

test('computeNextRcVersion starts at rc.1 when no rc exists for the base', () => {
  assert.equal(computeNextRcVersion('2.0.2', ['2.0.0', '2.0.1']), '2.0.2-rc.1')
})

test('computeNextRcVersion increments the highest existing rc', () => {
  assert.equal(computeNextRcVersion('2.0.2', ['2.0.2-rc.1', '2.0.2-rc.2']), '2.0.2-rc.3')
})

test('computeNextRcVersion compares numerically, not lexically (rc.10 > rc.9)', () => {
  assert.equal(computeNextRcVersion('2.0.2', ['2.0.2-rc.9', '2.0.2-rc.10']), '2.0.2-rc.11')
})

test('computeNextRcVersion ignores rc of other base versions', () => {
  assert.equal(computeNextRcVersion('2.0.2', ['2.0.1-rc.5', '1.9.9-rc.99']), '2.0.2-rc.1')
})

test('computeNextRcVersion ignores malformed rc suffixes', () => {
  assert.equal(computeNextRcVersion('2.0.2', ['2.0.2-rc.abc', '2.0.2-rc.']), '2.0.2-rc.1')
})

test('assertBaseVersionPublishable throws when the base version is already published', () => {
  assert.throws(() => assertBaseVersionPublishable('2.0.1', ['2.0.0', '2.0.1']), /not greater than/)
})

test('assertBaseVersionPublishable passes when the base version is unpublished and greater', () => {
  assert.doesNotThrow(() => assertBaseVersionPublishable('2.0.2', ['2.0.0', '2.0.1']))
})

test('assertBaseVersionPublishable throws when the base version is lower than the latest published release', () => {
  assert.throws(() => assertBaseVersionPublishable('2.0.0', ['2.0.0', '2.0.1']), /not greater than/)
})

test('assertBaseVersionPublishable ignores prereleases when finding the latest published release', () => {
  assert.doesNotThrow(() => assertBaseVersionPublishable('2.0.2', ['2.0.1', '2.0.2-rc.1']))
})

test('assertBaseVersionPublishable compares numerically, not lexically (2.0.10 > 2.0.9)', () => {
  assert.doesNotThrow(() => assertBaseVersionPublishable('2.0.10', ['2.0.9']))
})

test('assertBaseVersionPublishable passes when there are no published versions', () => {
  assert.doesNotThrow(() => assertBaseVersionPublishable('2.0.0', []))
})

const SCRIPT = fileURLToPath(new URL('./prerelease-version.mjs', import.meta.url))

function runCli(baseVersion, stdin) {
  const args = baseVersion === undefined ? [SCRIPT] : [SCRIPT, baseVersion]
  return spawnSync(process.execPath, args, {
    input: stdin,
    encoding: 'utf8'
  })
}

test('CLI prints the next rc version from a piped version list', () => {
  const result = runCli('2.0.2', '["2.0.2-rc.1"]')
  assert.equal(result.status, 0)
  assert.equal(result.stdout.trim(), '2.0.2-rc.2')
})

test('CLI treats empty stdin as no published versions -> rc.1', () => {
  const result = runCli('2.0.2', '')
  assert.equal(result.status, 0)
  assert.equal(result.stdout.trim(), '2.0.2-rc.1')
})

test('CLI exits 1 with a message when the base version is already published', () => {
  const result = runCli('2.0.1', '["2.0.0","2.0.1"]')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /not greater than|Bump the version/)
})

test('CLI exits 1 when no base version argument is given', () => {
  const result = runCli(undefined, '[]')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Usage/)
})
