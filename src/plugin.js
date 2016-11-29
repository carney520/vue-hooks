import { isPlainObject, warn } from './util.js'
import Action from './action.js'

export default function Plugin (options) {
  return {
    created () {
      initActions(this, options)
    }
  }
}

function initActions (vm, options) {
  const { actionPrefix, debug } = options
  const actionsOptions = vm.$options.actions

  if (!actionsOptions) return
  let actions = []
  if (Array.isArray(actionsOptions)) {
    actionsOptions.forEach(value => {
      if (typeof value === 'string') {
        actions.push({
          name: value,
          action: makeAction(value, vm, debug)
        })
      } else if (isPlainObject(value)) {
        const {name, action} = value
        if (name == null || !(action instanceof Action)) {
          warn(debug, `${value} is not a valid Action`)
        }
        actions.push(value)
      }
    })
  }

  if (actions.length) {
    vm.__actions__ = actions
    actions.forEach(({name, action}) => {
      vm[actionPrefix + name] = (payload, complete) => {
        return action.run(payload, complete)
      }
    })
  }
}

function makeAction (name, context, debug) {
  return new Action(name, context, debug)
  // before<Name>, after<Name>
  .define(name)
  // before<NAME>, after<NAME>
  .define(name.toUpperCase())
  // name. call order: before<name> -> before<NAME> -> name -> after<Name> -> after<NAME>
  .do(name)
}
