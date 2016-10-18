import { warn as $warn} from './util'
import { CancelActionError } from './errors'

const CANCEL = new CancelActionError()
const POSTHOOK = /^after/i,
      PREHOOK = /^before/i,
      MIDHOOK = /^on/i

export default function (options) {
  const {
    debug,
    actionPrefix,
   } = options

  return {
    methods: {
      /**
      * 调用一个动作，也可以通过`$$<action>(args)`的形式调用
      */
      $execute(name, ...args) {
        const action = this[`${actionPrefix}${name}`]
        if (typeof action === 'function') {
          action.apply(this, args)
        } else {
          throw new TypeError(`$execute Error: action named ${name} is non-existed. `)
        }
      },

      /**
      * 创建一个绑定了上下文的和参数的回调函数
      * @alias $bind
      */
      $makeCallback(callback, ...args) {
        if (typeof callback !== 'function') {
          throw new TypeError(`$makeCallback Error: callback must be a function.`)
        }

        return (...other) => {
          callback.apply(this, args.concat(other))
        }
      },

      $bind(...args) {
        return this.$makeCallback(...args)
      },

      /**
      * 是否正在处理中
      */
      $isProcessing(type, id) {
        if (this.actions && this.actions[type]) {
          if (Array.isArray(this.actions[type].processing)) {
            return this.actions[type].processing.indexOf(id) !== -1
          } else {
            return this.actions[type].processing
          }
        } else {
          return false
        }
      },

      /**
      * 将操作重定向到其他钩子
      */
      $redirectHook(name, payload, next, action) {
        let fn = (this.$options.hooks && this.$options.hooks[name]) || this[name]
        if (typeof fn === 'function') {
          fn.call(this, payload, next, action)
        } else {
          $warn(debug, `Hook(${name}) non-existed`)
          next(payload)
        }
      },

      /**
      * 调用钩子
      * @param {String} name - hook name
      * @param {Array} payload - hook payload
      */
      $callHook (name, payload = [], actionObject) {
        if (!Array.isArray(payload)) {
          throw new TypeError('CallHook Error: Payload must be array')
        }

        if (debug) {
          console.log(`＊CALLHOOK*: ${name} --- payload: `, payload, '--- action:', actionObject)
        }
        // check payload
        if (name.search(POSTHOOK) !== -1) {
          const [err] = payload
          if (err && !err instanceof Error) {
            $warn(debug, `CallHook warn: PostHook(${name}) first argument of payload must be \`null(undefined)\` or \`Error\` instance`)
          }
        }

        // resolve hooks
        let fn = (this.$options.hooks && this.$options.hooks[name]) || this[name]

        let hookWraper = (hook) => {
          return new Promise((resolve, reject) => {
            if (hook == void 0) {
              resolve(payload)
            } else if (typeof hook !== 'function') {
              return resolve(hook)
            }

            let next = (args) => {
              if (args instanceof Error) {
                reject(args)
              } else {
                resolve(args)
              }
            }

            next.cancel = () => {
              reject(CANCEL)
            }

            // 钩子接受三个参数，第一个是payload， 第二个是next，第三个是当前acion实例，
            let rt = hook.call(this, payload, next, actionObject)
            // is Promise
            if (rt && typeof rt.then === 'function') {
              resolve(rt)
            }
          })
          .then((args) => {
            // 转换payload
            if (args != void 0) {
              return [args]
            } else {
              return []
            }
          })
        }

        if (Array.isArray(fn)) {
          let promises = []
          fn.forEach(f => promises.push(hookWraper(f)))
          return Promise.all(promises)
        } else {
          return hookWraper(fn)
        }
      },
    },

  }
}
