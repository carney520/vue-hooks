import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  dest: 'dist/vue-hooks.js',
  format: 'umd',
  moduleName: 'VueHooks',
  plugins: [
    buble({objectAssign: 'Object.assign'})
  ],
  banner:
`
/**
 * vue-hook
 */
`
}