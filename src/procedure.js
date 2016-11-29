let uid = 0

// 使用 process 对象来维护hooks之间的数据交互，以及action的状态
export default class Procedure {
  constructor (state) {
    this.uid = uid++
    this.state = state
    this.locals = {}
    this.stack = []
  }

  setState (state) {
    this.state = state
    return this
  }

  getState () {
    return this.state
  }

  _push (value) {
    this.stack.push(value)
    return this
  }

  _pop () {
    return this.stack.pop()
  }

  _peek () {
    return this.stack[this.stack.length - 1]
  }

  // local state
  set (name, value) {
    this.locals[name] = value
    return this
  }

  get (name) {
    return this.locals[name]
  }

  destroy () {
    this.locals = null
    this.stack = null
  }
}