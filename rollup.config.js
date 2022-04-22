import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

const plugins = [
  resolve(),
  commonjs(),
  babel({
    babelHelpers: 'bundled',
    exclude: [/\/core-js\//]
  }),
  typescript({
    tsconfigOverride: {
      exclude: ["**/__tests__"]
    }
  })
]

function createBundle({ file, format, name, external, withUglify = false }) {
  return {
    input: 'src/main/index.ts',
    output: { file, format, name },
    plugins: withUglify ? [terser(), ...plugins] : plugins,
    external,
  }
}

const externalDependencies = Object.keys(pkg.dependencies)

function isNpmDependency(name) {
  if (externalDependencies.includes(name)) return true
  return /lodash/.test(name)
}

export default [
  createBundle({ file: pkg.main, format: 'cjs', external: isNpmDependency }),
  createBundle({ file: pkg.module, format: 'es', external: isNpmDependency }),
  createBundle({ file: 'umd/identity-core.js', format: 'umd', name: 'reach5' }),
  createBundle({ file: 'umd/identity-core.min.js', format: 'umd', name: 'reach5', withUglify: true })
]
