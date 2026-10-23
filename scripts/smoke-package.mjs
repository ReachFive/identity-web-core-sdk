/**
 * Smoke-tests the package the way integrators get it: from the tarball `npm publish` would upload.
 *
 * It installs that tarball in a throwaway project, then checks each documented way of using it:
 * - `require()` from CommonJS, which loads `cjs/main.js`;
 * - `import` from Node, which loads the same file through Node's CommonJS interop;
 * - a bundler, which follows the `module` field to `es/main.js` and must resolve its dependencies;
 * - the types, compiled by `tsc` from a CommonJS project and from a bundler project;
 * - the files jsDelivr serves, with the `<script>` bundle loaded by `scripts/smoke-umd.cjs`.
 *
 * Usage: npm run smoke:package   (requires `npm run build` first, and network access for npm install)
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// The files the documentation and the jsDelivr purge list in RELEASE.md point to. Renaming any of them
// breaks integrators silently.
const publishedFiles = ['cjs/main.js', 'es/main.js', 'es/main.d.ts', 'umd/identity-core.js', 'umd/identity-core.min.js']

const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' })
const step = (name, check) => {
  check()
  console.log(`✓ ${name}`)
}

const work = mkdtempSync(join(tmpdir(), 'identity-core-package-'))
try {
  const [{ filename, files }] = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', work], root))

  step('the tarball contains every documented file', () => {
    const paths = files.map((file) => file.path)
    const missing = publishedFiles.filter((file) => !paths.includes(file))
    if (missing.length > 0) throw new Error(`missing from the tarball: ${missing.join(', ')}`)
  })

  const project = join(work, 'project')
  run('mkdir', [project])
  writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'consumer', private: true }))
  run('npm', ['install', '--silent', '--no-audit', '--no-fund', join(work, filename)], project)
  const installed = join(project, 'node_modules', pkg.name)

  step('require() from CommonJS', () => {
    writeFileSync(
      join(project, 'require.cjs'),
      `if (typeof require('${pkg.name}').createClient !== 'function') process.exit(1)`
    )
    run('node', ['require.cjs'], project)
  })

  step('import from Node', () => {
    writeFileSync(
      join(project, 'import.mjs'),
      `import { createClient } from '${pkg.name}'\nif (typeof createClient !== 'function') process.exit(1)`
    )
    run('node', ['import.mjs'], project)
  })

  step('a bundler resolves the ES bundle and its dependencies', () => {
    writeFileSync(join(project, 'app.mjs'), `import { createClient } from '${pkg.name}'\nconsole.log(createClient)`)
    const rollup = join(root, 'node_modules', '.bin', 'rollup')
    const nodeResolve = join(root, 'node_modules', '@rollup', 'plugin-node-resolve', 'dist', 'es', 'index.js')
    const commonjs = join(root, 'node_modules', '@rollup', 'plugin-commonjs', 'dist', 'es', 'index.js')
    writeFileSync(
      join(project, 'rollup.config.mjs'),
      [
        `import nodeResolve from '${nodeResolve}'`,
        `import commonjs from '${commonjs}'`,
        `const onwarn = (warning) => { throw new Error(warning.message) }`,
        `export default { input: 'app.mjs', output: { file: 'bundle.js', format: 'es' }, onwarn, plugins: [nodeResolve({ browser: true }), commonjs()] }`
      ].join('\n')
    )
    run(rollup, ['-c', '--silent'], project)
    const bundle = readFileSync(join(project, 'bundle.js'), 'utf8')
    if (!bundle.includes('function createClient')) throw new Error('the bundle does not contain createClient')
  })

  const tsc = join(root, 'node_modules', '.bin', 'tsc')
  const typecheck = (name, compilerOptions) =>
    step(`types compile ${name}`, () => {
      writeFileSync(
        join(project, 'types.ts'),
        `import { createClient, type AuthResult } from '${pkg.name}'\nexport const client = createClient({ domain: 'example.com', clientId: 'id' })\nexport type Payload = AuthResult['idTokenPayload']\n`
      )
      const options = { strict: true, noEmit: true, skipLibCheck: false, lib: ['ES2020', 'DOM'], ...compilerOptions }
      writeFileSync(join(project, 'tsconfig.json'), JSON.stringify({ compilerOptions: options, files: ['types.ts'] }))
      run(tsc, ['-p', 'tsconfig.json'], project)
    })
  typecheck('from a CommonJS project (node16)', { module: 'node16', moduleResolution: 'node16' })
  typecheck('from a bundler project', { module: 'ESNext', moduleResolution: 'bundler' })
  typecheck('with the legacy node resolution', { module: 'CommonJS', moduleResolution: 'node10' })

  step('the <script> bundles load from the installed package', () => {
    run('node', [join(root, 'scripts', 'smoke-umd.cjs')], installed)
  })
} catch (error) {
  console.error(error.stdout || '', error.stderr || '', error.message)
  process.exitCode = 1
} finally {
  rmSync(work, { recursive: true, force: true })
}
