/**
* 实现hooks机制
*/
import methodsMixin from './methods'
import actionsMixin from './actions'
import Hook from './hook'

let Vue

export default function install(_Vue, options = {}) {
  if(Vue) {
    console.warn('vue-hooks already installed. Vue.use(VueHooks) should be called only once.')
    return
  }
  Vue = _Vue
  override(Vue, options)
}

function override(Vue, options) {
  options = {
    ...{
      debug: Vue.config.debug,
      actionPrefix: '$$',
    },
    options,
  }

  /**
  * hooks 选项合并策略
  */
  Vue.config.optionMergeStrategies.hooks = Vue.config.optionMergeStrategies.methods
  Vue.config.optionMergeStrategies.actions = (toVal = {}, fromVal = {}) => {
    if (fromVal.buildin) {
      if (toVal.buildin) {
        fromVal.buildin.forEach(val => {
          if (toVal.buildin.indexOf(val) !== -1) {
            console.warn(`Actions Warning: buildin conflict(${val}), to: ${toVal.buildin}, from: ${fromVal.buildin}. `)
          } else {
            toVal.buildin.push(val)
          }
        })
      } else {
        toVal.buildin = fromVal.buildin
      }
    }

    if (fromVal.custom) {
      toVal.custom = {...fromVal.custom, ...toVal.custom || {}}
    }
    return toVal
  }

  Vue.mixin(methodsMixin(options))
  Vue.mixin(actionsMixin(options))
  Vue.Hook = Hook
}
