import { upperFirst } from './util.js'
import Procedure from './procedure.js'

// TODO
// debug
// 支持promise
// Procedure 对象回收
// 观察者模式
// 异常捕获加强
// 流程跳转，skip, 回退
export default class Action {
  constructor (name, context, debug) {
    this.name = name
    this.context = context
    this.debug = debug
    this.hooks = []
    this._beforeEachListener = []
    this._afterEachListener = []
    return this
  }

  define (beforeHook, afterHook) {
    let beforeFn, afterFn
    if (typeof beforeHook === 'string' && afterHook === undefined) {
      let name = upperFirst(beforeHook)
      beforeFn = Action.resolveHook('before' + name, this.context)
      afterFn = Action.resolveHook('after' + name, this.context)
    } else {
      beforeFn = (typeof beforeHook === 'function' && beforeHook) ||
        (typeof beforeHook === 'string' && Action.resolveHook(beforeHook, this.context))

      afterFn = (typeof afterHook === 'function' && afterHook) ||
        (typeof afterHook === 'string' && Action.resolveHook(afterHook, this.context))
    }

    this.hooks.push({
      beforeFn,
      afterFn
    })

    return this
  }

  do (method) {
    let persistMethod = (typeof method === 'function' && method) || this.context[method]
    this.persistMethod = Action.persistMethodWrapper(persistMethod, this.context)
    return this
  }

  runQueue (initPayload, runner, complete) {
    let queue = this.hooks
    const { NORMAL, ERROR, ABORTED, POST } = Action.STATE
    let state = NORMAL
    let proc = new Procedure(NORMAL)
    proc._push(initPayload)
    if (queue.length === 0) return done()

    let done = () => {
      complete(proc)
      proc.destroy()
    }

    let step = (index) => {
      const procState = proc.getState()
      if (index < 0) {
        // done
        return done()
      } else if (state === NORMAL && procState === NORMAL && index >= queue.length) {
        return runner(this.persistMethod, proc, () => {
          // 进入收尾阶段
          state = POST
          proc.setState(POST)
          step(queue.length - 1)
        })
      }

      if (procState === ABORTED) {
        // aborted
        state = ABORTED
        return done()
      } else if (procState === ERROR && state === NORMAL) {
        // error
        state = ERROR
        index -= 1
      }

      if (state === NORMAL) {
        runner(queue[index].beforeFn, proc, () => {
          step(index + 1)
        })
      } else if (state === ERROR) {
        runner(queue[index].afterFn, proc, () => {
          step(index - 1)
        })
      } else {
        runner(queue[index].afterFn, proc, () => {
          step(index - 1)
        })
      }
    }

    step(0, proc)
    return proc
  }

  run (initPayload, complete) {
    const {NORMAL, ABORTED, POST, ERROR} = Action.STATE
    return this.runQueue(initPayload, (hook, proc, next) => {
      if (hook == null) return next()
      try {
        const input = proc._peek()
        if (this.debug) {
          let state = proc.state === NORMAL ? 'PRE' : 'POST'
          console.log(`***ACTION****-${state}-: ${this.name} --- input:`, input, ` --- locals: `, proc.locals)
        }

        let nextHook = (payload) => {
          proc._push(payload)
          if (payload instanceof Error) {
            proc.setState(ERROR)
          }
          next()
        }

        nextHook.abort = () => {
          proc.setState(ABORTED)
          next()
        }

        let args
        if (proc.state === ERROR || proc.state === POST) {
          args = input instanceof Error ? [input, null, proc, nextHook] : [null, input, proc, nextHook]
        } else {
          args = [input, proc, nextHook]
        }

        hook.apply(this.context, args)
      } catch (any) {
        proc._push(any instanceof Error ? any : new Error(any))
        proc.setState(ERROR)
        next()
      }
    }, (proc) => {
      typeof complete === 'function' && complete(proc)

      if (this.debug) {
        console.log(`****ACTION****: completed ${this.name} --- stack:`, proc.stack, ` --- locals: `, proc.locals)
      }
    })
  }
}

Action.STATE = {
  NORMAL: 1,
  ERROR: 2,
  ABORTED: 3,
  POST: 4
}

Action.resolveHook = function (name, context) {
  console.log('resolving: ', name)
  if (context == null) {
    return null
  } else {
    return (context.hooks && context.hooks[name]) ||
      context[name]
  }
}

Action.persistMethodWrapper = function (method, context) {
  return function (payload, proc, next) {
    return method.call(context, payload, proc, next)
  }
}