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

// Matches the previous `isNpmDependency` predicate exactly, so this build change stays
// behaviour-neutral. Note `buffer` is imported as `'buffer/'`, which does not match and is
// therefore still inlined rather than externalised — a wart removed when `buffer` goes away.
const runtimeDependencies = Object.keys(pkg.dependencies)
const isRuntimeDependency = (id) => runtimeDependencies.includes(id) || /lodash/.test(id)

const sourcePlugins = (target) => [
  nodeResolve(),
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
    plugins: sourcePlugins('ES2015')
  },
  {
    input: moduleEntry,
    output: [
      { banner, file: pkg.main, format: 'cjs' },
      { banner, file: pkg.module, format: 'es' }
    ],
    external: isRuntimeDependency,
    onwarn,
    plugins: sourcePlugins('ES2020')
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
    external: isRuntimeDependency,
    plugins: [dts({ tsconfig: './tsconfig.build.json' })]
  }
]
