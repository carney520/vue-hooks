/**
* 实现hooks机制
*/
import Action from './action.js'
import Plugin from './plugin.js'

let Vue

export default function install (_Vue, options = {}) {
  if (Vue) {
    console.warn('vue-hooks already installed.')
    return
  }
  if (options.persistMethodWrapper) {
    Action.persistMethodWrapper = options.persistMethodWrapper
  }

  Action.resolveHook = function (name, context) {
    if (context == null) {
      return
    } else {
      return (context.$options && context.$options.hooks && context.$options.hooks[name]) ||
        context[name]
    }
  }

  Vue = _Vue
  override(Vue, options)
}

function override (Vue, options) {
  options = {
    ...{
      debug: Vue.config.debug,
      actionPrefix: '$$'
    },
    options
  }

  /**
  * hooks 选项合并策略
  */
  Vue.config.optionMergeStrategies.hooks = Vue.config.optionMergeStrategies.methods
  Vue.mixin(Plugin(options))
  Vue.Action = Action
}

export {
  Action
}