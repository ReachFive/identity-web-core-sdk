import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import dts from 'rollup-plugin-dts'

const pkg = createRequire(import.meta.url)('./package.json')

const banner = [
  `/**`,
  ` * ${pkg.name} - v${pkg.version}`,
  ` * Compiled ${new Date().toUTCString().replace(/GMT/g, 'UTC')}`,
  ` *`,
  ` * Copyright (c) ReachFive.`,
  ` *`,
  ` * This source code is licensed under the MIT license found in the`,
  ` * LICENSE file in the root directory of this source tree.`,
  ` **/`
].join('\n')

/** Loaded via `<script>`/jsDelivr: ships polyfills, conservative syntax, everything inlined. */
const umdEntry = 'src/umd.ts'
/** Consumed by a bundler or Node: no polyfills, modern syntax, dependencies left external. */
const moduleEntry = 'src/main/index.ts'

// Runtime dependencies are left external in the `es` bundle and inlined in the UMD one.
// The `cjs` bundle inlines the ESM-only ones: `require()` cannot load them on Node below 20.19 / 22.12,
// nor in a Jest suite running in CommonJS, whatever the Node version. `jose` stays a dependency
// all the same, for the `es` bundle and for the published types, which import from it.
const runtimeDependencies = Object.keys(pkg.dependencies)
const esmOnlyDependencies = ['jose']
const isRuntimeDependency = (id) => runtimeDependencies.includes(id) || /lodash/.test(id)
const isRequirableDependency = (id) => isRuntimeDependency(id) && !esmOnlyDependencies.includes(id)

const sourcePlugins = ({ target, browser = false }) => [
  // `browser` matters for the UMD bundle, which inlines its dependencies: jose publishes separate
  // node and browser builds, and the node one imports `node:buffer`, which cannot ship to a browser.
  nodeResolve({ browser }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['src/**/__tests__/**'],
    importHelpers: true,
    // Declarations are emitted once by the `rollup-plugin-dts` pass below.
    declaration: false,
    declarationMap: false,
    target
  })
]

const sourceDirectory = fileURLToPath(new URL('src/', import.meta.url))

/**
 * An unresolved import silently becomes an external in a UMD bundle, producing a build that looks
 * fine and then throws at load time, so treat that and a few other structural problems as fatal.
 *
 * Import cycles are fatal only when they involve this package's own sources. Cycles inside
 * dependencies are common, usually harmless, and outside our control — failing the build on them
 * would mean a dependency bump could break it for no good reason.
 */
const onwarn = (warning) => {
  const fatal = ['UNRESOLVED_IMPORT', 'MISSING_EXPORT', 'MISSING_GLOBAL_NAME']
  const isOwnCycle =
    warning.code === 'CIRCULAR_DEPENDENCY' && (warning.ids ?? []).some((id) => id.startsWith(sourceDirectory))

  if (fatal.includes(warning.code) || isOwnCycle) throw new Error(`${warning.code}: ${warning.message}`)
  console.warn(warning.message)
}

export default [
  {
    input: umdEntry,
    onwarn,
    output: [
      { banner, file: 'umd/identity-core.js', format: 'umd', name: 'reach5' },
      {
        banner,
        file: 'umd/identity-core.min.js',
        format: 'umd',
        name: 'reach5',
        // terser runs after `output.banner` is prepended and strips comments, so the
        // licence header has to be reinstated as a preamble it will preserve.
        plugins: [terser({ format: { preamble: banner } })]
      }
    ],
    plugins: sourcePlugins({ target: 'ES2015', browser: true })
  },
  {
    input: moduleEntry,
    output: { banner, file: pkg.module, format: 'es' },
    external: isRuntimeDependency,
    onwarn,
    plugins: sourcePlugins({ target: 'ES2020' })
  },
  {
    input: moduleEntry,
    output: { banner, file: pkg.main, format: 'cjs' },
    external: isRequirableDependency,
    onwarn,
    plugins: sourcePlugins({ target: 'ES2020' })
  },
  {
    input: moduleEntry,
    // `InAppBrowser` is a global from `@types/cordova-plugin-inappbrowser` (a runtime
    // dependency for that reason) and appears in `loginWithSocialProvider`'s return type.
    // `rollup-plugin-dts` does not carry over the reference directive `tsc` would emit.
    output: {
      banner: `${banner}\n/// <reference types="cordova-plugin-inappbrowser" />`,
      file: pkg.types,
      format: 'es'
    },
    // jose's types are inlined: an `import` of the ESM-only `jose` would not compile in a CommonJS
    // project under `module: node16` (TS1479), even for a type.
    external: isRequirableDependency,
    plugins: [dts({ tsconfig: './tsconfig.build.json', respectExternal: true })]
  }
]
