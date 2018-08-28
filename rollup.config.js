import typescript from 'typescript'
import typescriptPlugin from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'


const isProd = process.env.BUILD === 'production'

const plugins = [
  commonjs({
    namedExports: { 'node_modules/winchan/winchan.js': ['open'] }
  }),
  typescriptPlugin({
    typescript,
    importHelpers: true
  })
]
.concat(isProd ? terser() : [])

export default [
	{
		input: 'src/main/main.ts',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
    ],
    plugins,
    onwarn: message => {
      // We could list all the external modules to remove these warnings... but listing lodash-es
      // doesn't include all its sub-modules such as lodash-es/pickBy, etc so
      // it becomes incredibly tedious.
      if (/treating it as an external dependency/.test(message)) return
      console.warn(message)
    }
	}
]