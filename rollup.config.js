import typescript from 'typescript'
import typescriptPlugin from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
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

export default [
	{
		input: 'src/main/main.ts',
		output: [
			{ file: pkg.main, format: 'umd', name: 'reach5' },
			{ file: pkg.module, format: 'es' }
    ],
    plugins,
    onwarn: message => {
      // tsc generates local polyfills such as __extends with 'this' referenced
      if (message.code === 'THIS_IS_UNDEFINED') return

      // space-lift Option depends on Either (for its toEither method) and Either depends on Option (toOption)
      // No great way around that I'm afraid.
      if (message.code === 'CIRCULAR_DEPENDENCY' && message.importer === 'node_modules/space-lift/es/option/index.js') return

      // We could list all the external modules to remove these warnings... but listing lodash-es
      // doesn't include all its sub-modules such as lodash-es/pickBy, etc so
      // it becomes incredibly tedious.
      if (/treating it as an external dependency/.test(message)) return
      console.warn(message)
    }
	}
]