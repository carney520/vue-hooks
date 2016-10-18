// TODO 可不可以不写死

import './polyfill'
import { ValidateError, PersistError, CancelActionError } from './errors'
import { warn as $warn, upperFirst, pick, isPlainObject } from './util'

let debug = true



/**
* 动作类, 每一个动作流程都会创建一个动作实例，可以通过这个动作实例保存当前动作流程的局部变量
*/
let uid = 0
export class Action {
  constructor (name) {
    this.name = name
    this._uid = uid++
    this.locals = {}
  }

  get (name) {
    return this.locals[name]
  }

  set (name, value) {
    this.locals[name] = value
    return this
  }

  clear () {
    this.locals = {}
  }
}

Action.ValidateError = ValidateError
Action.PersistError = PersistError
Action.CancelActionError = CancelActionError

/**
* buildin actions
*/
const buildInMethods = {
  create: makeActionValidatable('create'),
  update: makeActionValidatable('update'),
  destroy: makeAction('destroy'),
  get: makeAction('get'),
  getList: makeAction('getList'),
}

/**
* 注入'动作'
* @description
*  在vue组件初始化是，检查actions选项，如;
*    ```
*    export default {
*     actions: {
*       // 筛选内置预定义的动作
*       buildin: ['getList', 'get', 'destroy'],
*       // 自定义动作
*       custom: {
*         login: {
*           // 是否带验证钩子
*           validatable: true,
*           // 对应的持久化方法
*           persistMethodName: 'LOGIN',
*         },
*       },
*     }
*    }
*    ```
*    那么,vue-hooks将会生成 $$getList, $$get, $$destroy, $$login 等动作方法，这些方法会经过预定义的钩子
* @param {Object} vm - vue instance
* @param {Object} options - vue-hooks options
*/
function initActions (vm, options){
  const { actionPrefix } =  options

  const actionsOptions = vm.$options.actions
  if (actionsOptions == null) return

  const { buildin, custom } = actionsOptions
  let methods = {}

  // buildin actions
  if (Array.isArray(buildin)) {
    methods = pick(buildInMethods, ...buildin)
  } else if (buildin) {
    methods = {...buildInMethods}
  }

  // custom actions
  if (custom && isPlainObject(custom)) {
    for (let key in custom) {
      let value = custom[key]

      if (isPlainObject(value)) {
        // 预防未来添加更多的选项
        const {
          persistMethodName,
          validatable,
        } = value

        if (validatable) {
          // 添加验证钩子的动作
          methods[key] = makeActionValidatable(key, persistMethodName)
        } else {
          methods[key] = makeAction(key, persistMethodName)
        }
      } else {
        if (value) {
          // 添加验证钩子的动作
          methods[key] = makeActionValidatable(key)
        } else {
          methods[key] = makeAction(key)
        }
      }
    }
  }

  for (let key in methods) {
    vm[`${actionPrefix}${key}`] = methods[key].bind(vm)
  }
}

/**
* @description
*   上一个钩子的返回值将作为下一个钩子的输入
*   为了方便参数传递，约定传输的传入和输出载荷都是一个数组
*   钩子函数还可以接受第三个参数，action实例，是当前动作的一个实例，可以进行动作局部变量的保存，以及取消动作。
* @note
*   每个动作最后都必须是resolve或reject状态的，如果一直处理pending状态将会导致内存溢出。特别是在模态框应用中，模态框可以被取消的，这时需要
*   显式取消动作，不然动作会一直处于pending状态，导致action对象，或者一个回调无法释放。可以通过抛出CancelActionError, 或者调用 next.cancel()
*   来取消动作
* @param {String} name - action name
* @param {String} persistMethodName [name.toUpperCase()] - 持久化方法的名称，即vuex的action
* @return {Function} - action
*/
function makeActionValidatable(name, persistMethodName) {
  const capitalized = upperFirst(name),
        upperCased  = name.toUpperCase()

  persistMethodName = persistMethodName || upperCased

  return function resourceAction (...args) {
    const action = new Action(name)

    // ✅ 正常流程
    return this.$callHook(`before${capitalized}`, args, action)
    .then((args) => {
      //验证
      return this.$callHook(`on${capitalized}Validate`, args, action)
    })
    .then((args) => {
      // 持久化前序
      return this.$callHook(`before${upperCased}`, args, action)
    })
    .then((args) => {
      // 开始持久化
      action.set('params', args[0])
      return vuexActionWrapper(this[persistMethodName], args, this, upperCased)
    })
    .then((args) => {
      // 持久化后序
      args.unshift(null)
      args[2] = action.get('params')
      return this.$callHook(`after${upperCased}`, args, action)
    })
    .then((args) => {
      // 动作完成
      args.unshift(null)
      return this.$callHook(`after${capitalized}`, args, action)
    })
    // ❌ 错误处理, 后置钩子还用于错误处理
    .catch((err) => {
      // 验证错误
      if (err instanceof ValidateError) {
        return this.$callHook(`after${capitalized}Validate`, [err], action)
      } else {
        throw err
      }
    })
    .catch((err) => {
      // 持久化错误
      if (err instanceof PersistError) {
        const args = [err, null, action.get('params')]
        return this.$callHook(`after${upperCased}`, args, action)
      } else {
        // 未知错误
        throw err
      }
    })
    .catch((err) => {
      if (err instanceof CancelActionError) {
        if (debug) {
          console.warn(`**Action**: (${name}) canceled!`)
        }
        return this.$callHook(`after${capitalized}`, [null], action)
      } else {
        throw err
      }
    })
    .finally(() => {
      action.clear()
    })
  }
}

/**
* 不带验证的动作
* @param {String} name - action name
* @param {String} persistMethodName [name.toUpperCase()] - 持久化方法的名称，即vuex的action
*/
function makeAction(name, persistMethodName) {
  const capitalized = upperFirst(name),
        upperCased  = name.toUpperCase()

  persistMethodName = persistMethodName || upperCased

  return function resourceAction (...args) {
    const action = new Action(name)

    return this.$callHook(`before${capitalized}`, args, action)
      .then((args) => {
        // 持久化前序
        return this.$callHook(`before${upperCased}`, args, action)
      })
      .then((args) => {
        // 开始持久化
        action.set('params', args[0])
        return vuexActionWrapper(this[persistMethodName], args, this, upperCased)
      })
      .then((args) => {
        // 持久化后序
        args.unshift(null)
        args[2] =  action.get('params')
        return this.$callHook(`after${upperCased}`, args, action)
      })
      .then((args) => {
        // 动作完成
        args.unshift(null)
        return this.$callHook(`after${capitalized}`, args, action)
      })
      .catch((err) => {
        // 持久化错误
        if (err instanceof PersistError) {
          const args = [err, null, action.get('params')]
          return this.$callHook(`after${upperCased}`, args, action)
        } else {
          // 未知错误
          throw err
        }
      })
      .catch((err) => {
        if (err instanceof CancelActionError) {
          if (debug) {
            console.warn(`**Action**: (${name}) canceled!`)
          }
          return this.$callHook(`after${capitalized}`, [null], action)
        } else {
          throw err
        }
      })
      .finally(() => {
        action.clear()
      })
  }
}

/**
* 让vuex 的action 也符合钩子规范
* @param {Function} fn - 持久化动作
* @param {Array} args - 上一个钩子的载荷
* @param {Object} context - 动作执行的上下文
* @param {String} name - 动作名
*/
function vuexActionWrapper (fn, args = [], context, name) {
  if (debug) {
    console.log(`＊PERSIST*: ${name} --- payload: `, args)
  }

  if (fn) {
    return new Promise((resolve, reject) => {
      args.push((err, data) => {
        if (err) {
          if (err instanceof Error) {
            reject(new PersistError(err))
          } else {
            $warn(debug, `Callback Error: the first param of vuex action(${name}) callback must be a Error object or null.`)
            resolve(err)
          }
        } else {
          resolve(data)
        }
      })

      let rt = fn.apply(context, args)

      // is promise
      if (rt && typeof rt.then === 'function') {
        rt.then((args) => {
          resolve(args)
        })
        .catch((err) => {
          reject(new PersistError(err))
        })
      }
    })
    .then((args) => {
      if (args != void 0) {
        return [args]
      } else {
        return []
      }
    })
  } else {
    $warn(debug, `Warning: ${name} not implemented`)
    // 不存在直接传递参数
    return Promise.resolve(args)
  }
}

/**
* 初始化动作
*/
export default function actionMixin (options) {
  debug = options.debug
  return {
    init () {
      initActions(this, options)
    },
  }
}
