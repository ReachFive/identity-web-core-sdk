import typescript from 'typescript'

import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import typescriptPlugin from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser';

import pkg from './package.json'

const banner = [
    `/**`,
    ` * ${pkg.name} - v${pkg.version}`,
    ` * Compiled ${(new Date()).toUTCString().replace(/GMT/g, 'UTC')}`,
    ` *`,
    ` * Copyright (c) ReachFive.`,
    ` *`,
    ` * This source code is licensed under the MIT license found in the`,
    ` * LICENSE file in the root directory of this source tree.`,
    ` **/`,
].join('\n');

const plugins = [
  resolve(),
  commonjs({
    namedExports: { 'node_modules/winchan/winchan.js': ['open'] }
  }),
  babel({ 
    exclude: [/\/core-js\//]
  }),
  typescriptPlugin({
    typescript,
    importHelpers: true
  })
]

const externalDependencies = Object.keys(pkg.dependencies)

function isNpmDependency(name) {
  if (externalDependencies.includes(name)) return true
  return /lodash/.test(name)
}

function createBundle({ file, format, name, external, withUglify = false }) {
  return {
		input: 'src/main/index.ts',
		output: { banner, file, format, name },
    plugins: withUglify ? [terser({ output: { preamble: banner } }), ...plugins] : plugins,
    external,
    onwarn: message => {
      // tsc generates local polyfills such as __extends with 'this' referenced
      if (message.code === 'THIS_IS_UNDEFINED') return

      // space-lift Option depends on Either (for its toEither method) and Either depends on Option (toOption)
      // No great way around that I'm afraid.
      if (message.code === 'CIRCULAR_DEPENDENCY' && message.importer === 'node_modules/space-lift/es/option/index.js') return

      console.warn(message)
    }
	}
}

export default [
  createBundle({ file: 'umd/identity-core.min.js', format: 'umd', name: 'reach5', withUglify: true }),
  createBundle({ file: 'umd/identity-core.js', format: 'umd', name: 'reach5' }),
  createBundle({ file: pkg.main, format: 'cjs', external: isNpmDependency }),
  createBundle({ file: pkg.module, format: 'es', external: isNpmDependency })
]
