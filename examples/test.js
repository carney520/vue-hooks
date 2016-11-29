var VueHook = require('../dist/vue-hooks.js')
var Action = VueHook.Action

var context = {
  beforeA: (payload, proc, next) => {
    console.log('A')
    setTimeout(() => {
      next(new Error('A errro'))
    }, 20)
  },
  afterA: (err, payload, proc, next) => {
    if (err) {
      console.log('A catch ', err)
    } else {
      console.log('after A')
    }
    next('after A')
  },
  dosomething (payload, proc, next) {
    console.log('hi')
    next('dosomething finished')
  }
}

var action = new Action('name', context, true)
  .define('A')
  .define((payload, proc, next) => {
    console.log(payload, ' => B callback')
    next('B')
  },
  (err, payload, proc, next) => {
    if (err) {
      console.log('Be catch error', err)
    } else {
      console.log(payload, '=> Be')
    }
    next('Be')
  })
  .define((payload, proc, next) => {
    console.log(payload, ' => C callback')
    next('C')
  },
  (err, payload, proc, next) => {
    if (err) {
      console.log('Ce catch error', err)
    } else {
      console.log(payload, '=> Ce')
    }
    next('Ce')
  })
  .do('dosomething')

action.run('start')
