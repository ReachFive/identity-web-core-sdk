import typescript from 'typescript'
import typescriptPlugin from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'


const plugins = [
  nodeResolve(),
  commonjs({
    namedExports: { 'node_modules/winchan/winchan.js': ['open'] }
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
		input: 'src/main/main.ts',
		output: { file, format, name },
    plugins: withUglify ? [uglify(), ...plugins] : plugins,
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
