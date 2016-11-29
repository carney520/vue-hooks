
/**
 * vue-hook
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.VueHooks = global.VueHooks || {})));
}(this, (function (exports) { 'use strict';

/**
* 首字母大写
*/
function upperFirst (string) {
  if (string.length > 1) {
    return string.slice(0, 1).toUpperCase() + string.slice(1)
  } else {
    return string
  }
}

/**
* 输出警告信息
*/
function warn (debug, message) {
  if (debug) {
    console.warn(message);
    console.trace && console.trace();
  }
}



/**
 * thanks lodash
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject (value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString !== 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var getPrototypeOf = Object.getPrototypeOf;

function isObjectLike (value) {
  return !!value && typeof value === 'object'
}

function isPlainObject (value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) !== objectTag || isHostObject(value)) {
    return false
  }
  var proto = getPrototypeOf(value);
  if (proto === null) {
    return true
  }
  var Ctor = proto.constructor;
  return (typeof Ctor === 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString)
}

var uid = 0;

// 使用 process 对象来维护hooks之间的数据交互，以及action的状态
var Procedure = function Procedure (state) {
  this.uid = uid++;
  this.state = state;
  this.locals = {};
  this.stack = [];
};

Procedure.prototype.setState = function setState (state) {
  this.state = state;
  return this
};

Procedure.prototype.getState = function getState () {
  return this.state
};

Procedure.prototype._push = function _push (value) {
  this.stack.push(value);
  return this
};

Procedure.prototype._pop = function _pop () {
  return this.stack.pop()
};

Procedure.prototype._peek = function _peek () {
  return this.stack[this.stack.length - 1]
};

// local state
Procedure.prototype.set = function set (name, value) {
  this.locals[name] = value;
  return this
};

Procedure.prototype.get = function get (name) {
  return this.locals[name]
};

Procedure.prototype.destroy = function destroy () {
  this.locals = null;
  this.stack = null;
};

// TODO
// debug
// 支持promise
// Procedure 对象回收
// 观察者模式
// 异常捕获加强
// 流程跳转，skip, 回退
var Action = function Action (name, context, debug) {
  this.name = name;
  this.context = context;
  this.debug = debug;
  this.hooks = [];
  this._beforeEachListener = [];
  this._afterEachListener = [];
  return this
};

Action.prototype.define = function define (beforeHook, afterHook) {
  var beforeFn, afterFn;
  if (typeof beforeHook === 'string' && afterHook === undefined) {
    var name = upperFirst(beforeHook);
    beforeFn = Action.resolveHook('before' + name, this.context);
    afterFn = Action.resolveHook('after' + name, this.context);
  } else {
    beforeFn = (typeof beforeHook === 'function' && beforeHook) ||
      (typeof beforeHook === 'string' && Action.resolveHook(beforeHook, this.context));

    afterFn = (typeof afterHook === 'function' && afterHook) ||
      (typeof afterHook === 'string' && Action.resolveHook(afterHook, this.context));
  }

  this.hooks.push({
    beforeFn: beforeFn,
    afterFn: afterFn
  });

  return this
};

Action.prototype.do = function do$1 (method) {
  var persistMethod = (typeof method === 'function' && method) || this.context[method];
  this.persistMethod = Action.persistMethodWrapper(persistMethod, this.context);
  return this
};

Action.prototype.runQueue = function runQueue (initPayload, runner, complete) {
    var this$1 = this;

  var queue = this.hooks;
  var ref = Action.STATE;
    var NORMAL = ref.NORMAL;
    var ERROR = ref.ERROR;
    var ABORTED = ref.ABORTED;
    var POST = ref.POST;
  var state = NORMAL;
  var proc = new Procedure(NORMAL);
  proc._push(initPayload);
  if (queue.length === 0) { return done() }

  var done = function () {
    complete(proc);
    proc.destroy();
  };

  var step = function (index) {
    var procState = proc.getState();
    if (index < 0) {
      // done
      return done()
    } else if (state === NORMAL && procState === NORMAL && index >= queue.length) {
      return runner(this$1.persistMethod, proc, function () {
        // 进入收尾阶段
        state = POST;
        proc.setState(POST);
        step(queue.length - 1);
      })
    }

    if (procState === ABORTED) {
      // aborted
      state = ABORTED;
      return done()
    } else if (procState === ERROR && state === NORMAL) {
      // error
      state = ERROR;
      index -= 1;
    }

    if (state === NORMAL) {
      runner(queue[index].beforeFn, proc, function () {
        step(index + 1);
      });
    } else if (state === ERROR) {
      runner(queue[index].afterFn, proc, function () {
        step(index - 1);
      });
    } else {
      runner(queue[index].afterFn, proc, function () {
        step(index - 1);
      });
    }
  };

  step(0, proc);
  return proc
};

Action.prototype.run = function run (initPayload, complete) {
    var this$1 = this;

  var ref = Action.STATE;
    var NORMAL = ref.NORMAL;
    var ABORTED = ref.ABORTED;
    var POST = ref.POST;
    var ERROR = ref.ERROR;
  return this.runQueue(initPayload, function (hook, proc, next) {
    if (hook == null) { return next() }
    try {
      var input = proc._peek();
      if (this$1.debug) {
        var state = proc.state === NORMAL ? 'PRE' : 'POST';
        console.log(("***ACTION****-" + state + "-: " + (this$1.name) + " --- input:"), input, " --- locals: ", proc.locals);
      }

      var nextHook = function (payload) {
        proc._push(payload);
        if (payload instanceof Error) {
          proc.setState(ERROR);
        }
        next();
      };

      nextHook.abort = function () {
        proc.setState(ABORTED);
        next();
      };

      var args;
      if (proc.state === ERROR || proc.state === POST) {
        args = input instanceof Error ? [input, null, proc, nextHook] : [null, input, proc, nextHook];
      } else {
        args = [input, proc, nextHook];
      }

      hook.apply(this$1.context, args);
    } catch (any) {
      proc._push(any instanceof Error ? any : new Error(any));
      proc.setState(ERROR);
      next();
    }
  }, function (proc) {
    typeof complete === 'function' && complete(proc);

    if (this$1.debug) {
      console.log(("****ACTION****: completed " + (this$1.name) + " --- stack:"), proc.stack, " --- locals: ", proc.locals);
    }
  })
};

Action.STATE = {
  NORMAL: 1,
  ERROR: 2,
  ABORTED: 3,
  POST: 4
};

Action.resolveHook = function (name, context) {
  console.log('resolving: ', name);
  if (context == null) {
    return null
  } else {
    return (context.hooks && context.hooks[name]) ||
      context[name]
  }
};

Action.persistMethodWrapper = function (method, context) {
  return function (payload, proc, next) {
    return method.call(context, payload, proc, next)
  }
};

function Plugin (options) {
  return {
    created: function created () {
      initActions(this, options);
    }
  }
}

function initActions (vm, options) {
  var actionPrefix = options.actionPrefix;
  var debug = options.debug;
  var actionsOptions = vm.$options.actions;

  if (!actionsOptions) { return }
  var actions = [];
  if (Array.isArray(actionsOptions)) {
    actionsOptions.forEach(function (value) {
      if (typeof value === 'string') {
        actions.push({
          name: value,
          action: makeAction(value, vm, debug)
        });
      } else if (isPlainObject(value)) {
        var name = value.name;
        var action = value.action;
        if (name == null || !(action instanceof Action)) {
          warn(debug, (value + " is not a valid Action"));
        }
        actions.push(value);
      }
    });
  }

  if (actions.length) {
    vm.__actions__ = actions;
    actions.forEach(function (ref) {
      var name = ref.name;
      var action = ref.action;

      vm[actionPrefix + name] = function (payload, complete) {
        return action.run(payload, complete)
      };
    });
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

/**
* 实现hooks机制
*/
var Vue;

function install (_Vue, options) {
  if ( options === void 0 ) options = {};

  if (Vue) {
    console.warn('vue-hooks already installed.');
    return
  }
  if (options.persistMethodWrapper) {
    Action.persistMethodWrapper = options.persistMethodWrapper;
  }

  Action.resolveHook = function (name, context) {
    if (context == null) {
      return
    } else {
      return (context.$options && context.$options.hooks && context.$options.hooks[name]) ||
        context[name]
    }
  };

  Vue = _Vue;
  override(Vue, options);
}

function override (Vue, options) {
  options = Object.assign({}, {
      debug: Vue.config.debug,
      actionPrefix: '$$'
    },
    {options: options});

  /**
  * hooks 选项合并策略
  */
  Vue.config.optionMergeStrategies.hooks = Vue.config.optionMergeStrategies.methods;
  Vue.mixin(Plugin(options));
  Vue.Action = Action;
}

exports['default'] = install;
exports.Action = Action;

Object.defineProperty(exports, '__esModule', { value: true });

})));
