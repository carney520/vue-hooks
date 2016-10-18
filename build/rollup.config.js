import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/vue-hooks.js',
  format: 'umd',
  moduleName: 'VueHooks',
  plugins: [
    babel(),
  ],
  banner: 
`
/**
 * vue-hook
 */
`,
}