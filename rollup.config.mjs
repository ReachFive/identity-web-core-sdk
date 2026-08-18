import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { createRequire } from 'node:module'
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

// Runtime dependencies are left external in the `es`/`cjs` bundles and inlined in the UMD one.
// `jose` qualifies because it publishes both ESM and CJS entry points; an ESM-only package would
// have to be bundled instead, or `require('cjs/main.js')` would fail on Node below 22.
const runtimeDependencies = Object.keys(pkg.dependencies)
const isRuntimeDependency = (id) => runtimeDependencies.includes(id) || /lodash/.test(id)

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

/**
 * An unresolved import silently becomes an external in a UMD bundle, producing a build that
 * looks fine but throws at load time. Treat it — and a few other structural problems — as fatal.
 */
const onwarn = (warning) => {
  const fatal = ['UNRESOLVED_IMPORT', 'MISSING_EXPORT', 'MISSING_GLOBAL_NAME', 'CIRCULAR_DEPENDENCY']
  if (fatal.includes(warning.code)) throw new Error(`${warning.code}: ${warning.message}`)
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
    output: [
      { banner, file: pkg.main, format: 'cjs' },
      { banner, file: pkg.module, format: 'es' }
    ],
    external: isRuntimeDependency,
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
    external: isRuntimeDependency,
    plugins: [dts({ tsconfig: './tsconfig.build.json' })]
  }
]
