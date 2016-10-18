
/**
 * vue-hook
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueHooks = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();











var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
* 首字母大写
*/
function upperFirst(string) {
  if (string.length > 1) {
    return string.slice(0, 1).toUpperCase() + string.slice(1);
  } else {
    return string;
  }
}

/**
* 输出警告信息
*/
function warn(debug, message) {
  if (debug) {
    console.warn(message);
    console.trace && console.trace();
  }
}

function pick(obj) {
  var result = {};
  if (obj == null) return result;

  for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    keys[_key - 1] = arguments[_key];
  }

  keys.forEach(function (key) {
    result[key] = obj[key];
  });

  return result;
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
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
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

function isObjectLike(value) {
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
}

function isPlainObject(value) {
  if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  var Ctor = proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

/**
* 使得babel 可以继承JS内置类，比如Error，Array
* @link http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
*/
function ExtendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }
  ExtendableBuiltin.prototype = Object.create(cls.prototype);
  Object.setPrototypeOf(ExtendableBuiltin, cls);

  return ExtendableBuiltin;
}

var ValidateError = function (_ExtendableBuiltin) {
  inherits(ValidateError, _ExtendableBuiltin);

  function ValidateError(message) {
    classCallCheck(this, ValidateError);

    var _this = possibleConstructorReturn(this, (ValidateError.__proto__ || Object.getPrototypeOf(ValidateError)).call(this, message));

    _this.message = message;
    _this.name = "ValidateError";
    _this.stack = new Error().stack;
    return _this;
  }

  return ValidateError;
}(ExtendableBuiltin(Error));

var PersistError = function (_ExtendableBuiltin2) {
  inherits(PersistError, _ExtendableBuiltin2);

  function PersistError(data) {
    classCallCheck(this, PersistError);

    if (data instanceof Error) {
      var _this2 = possibleConstructorReturn(this, (PersistError.__proto__ || Object.getPrototypeOf(PersistError)).call(this, data.message));

      Object.assign(_this2, data);
      _this2.message = data.message;
    } else {
      var _this2 = possibleConstructorReturn(this, (PersistError.__proto__ || Object.getPrototypeOf(PersistError)).call(this, data));

      _this2.message = data;
    }
    _this2.name = 'PersistError';
    _this2.stack = new Error().stack;
    return possibleConstructorReturn(_this2);
  }

  return PersistError;
}(ExtendableBuiltin(Error));

/**
* 如果要中断动作流程时抛出此错误
*/
var CancelActionError = function (_ExtendableBuiltin3) {
  inherits(CancelActionError, _ExtendableBuiltin3);

  function CancelActionError(message) {
    classCallCheck(this, CancelActionError);

    var _this3 = possibleConstructorReturn(this, (CancelActionError.__proto__ || Object.getPrototypeOf(CancelActionError)).call(this, message));

    _this3.name = 'CancelActionError';
    _this3.message = message;
    return _this3;
  }

  return CancelActionError;
}(ExtendableBuiltin(Error));

var CANCEL = new CancelActionError();
var POSTHOOK = /^after/i;

var methodsMixin = function (options) {
  var debug = options.debug;
  var actionPrefix = options.actionPrefix;


  return {
    methods: {
      /**
      * 调用一个动作，也可以通过`$$<action>(args)`的形式调用
      */
      $execute: function $execute(name) {
        var action = this['' + actionPrefix + name];
        if (typeof action === 'function') {
          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          action.apply(this, args);
        } else {
          throw new TypeError('$execute Error: action named ' + name + ' is non-existed. ');
        }
      },


      /**
      * 创建一个绑定了上下文的和参数的回调函数
      * @alias $bind
      */
      $makeCallback: function $makeCallback(callback) {
        var _this = this;

        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        if (typeof callback !== 'function') {
          throw new TypeError('$makeCallback Error: callback must be a function.');
        }

        return function () {
          for (var _len3 = arguments.length, other = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            other[_key3] = arguments[_key3];
          }

          callback.apply(_this, args.concat(other));
        };
      },
      $bind: function $bind() {
        return this.$makeCallback.apply(this, arguments);
      },


      /**
      * 是否正在处理中
      */
      $isProcessing: function $isProcessing(type, id) {
        if (this.actions && this.actions[type]) {
          if (Array.isArray(this.actions[type].processing)) {
            return this.actions[type].processing.indexOf(id) !== -1;
          } else {
            return this.actions[type].processing;
          }
        } else {
          return false;
        }
      },


      /**
      * 将操作重定向到其他钩子
      */
      $redirectHook: function $redirectHook(name, payload, next, action) {
        var fn = this.$options.hooks && this.$options.hooks[name] || this[name];
        if (typeof fn === 'function') {
          fn.call(this, payload, next, action);
        } else {
          warn(debug, 'Hook(' + name + ') non-existed');
          next(payload);
        }
      },


      /**
      * 调用钩子
      * @param {String} name - hook name
      * @param {Array} payload - hook payload
      */
      $callHook: function $callHook(name) {
        var _this2 = this;

        var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var actionObject = arguments[2];

        if (!Array.isArray(payload)) {
          throw new TypeError('CallHook Error: Payload must be array');
        }

        if (debug) {
          console.log('\uFF0ACALLHOOK*: ' + name + ' --- payload: ', payload, '--- action:', actionObject);
        }
        // check payload
        if (name.search(POSTHOOK) !== -1) {
          var _payload = slicedToArray(payload, 1);

          var err = _payload[0];

          if (err && !err instanceof Error) {
            warn(debug, 'CallHook warn: PostHook(' + name + ') first argument of payload must be `null(undefined)` or `Error` instance');
          }
        }

        // resolve hooks
        var fn = this.$options.hooks && this.$options.hooks[name] || this[name];

        var hookWraper = function hookWraper(hook) {
          return new Promise(function (resolve, reject) {
            if (hook == void 0) {
              resolve(payload);
            } else if (typeof hook !== 'function') {
              return resolve(hook);
            }

            var next = function next(args) {
              if (args instanceof Error) {
                reject(args);
              } else {
                resolve(args);
              }
            };

            next.cancel = function () {
              reject(CANCEL);
            };

            // 钩子接受三个参数，第一个是payload， 第二个是next，第三个是当前acion实例，
            var rt = hook.call(_this2, payload, next, actionObject);
            // is Promise
            if (rt && typeof rt.then === 'function') {
              resolve(rt);
            }
          }).then(function (args) {
            // 转换payload
            if (args != void 0) {
              return [args];
            } else {
              return [];
            }
          });
        };

        if (Array.isArray(fn)) {
          var _ret = function () {
            var promises = [];
            fn.forEach(function (f) {
              return promises.push(hookWraper(f));
            });
            return {
              v: Promise.all(promises)
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
          return hookWraper(fn);
        }
      }
    }

  };
};

/**
* Promise polyfills
*/
if (typeof Promise !== 'function' && (typeof Promise === 'undefined' ? 'undefined' : _typeof(Promise)) !== 'object') {
  throw "Cannot polyfill Promise when it is " + JSON.stringify(Promise);
}

if (typeof Promise.prototype.done !== 'function') {
  var rejectByThrowing = function rejectByThrowing(err) {
    setTimeout(function () {
      throw err;
    }, 0);
  };

  Promise.prototype.done = function () {
    this.then.apply(this, arguments).then(null, rejectByThrowing);
  };
}

if (typeof Promise.prototype.finally !== 'function') {
  Promise.prototype.finally = function (callback) {
    return this.then(function (value) {
      return Promise.resolve(callback()).then(function () {
        return value;
      });
    }, function (err) {
      return Promise.resolve(callback()).then(function () {
        throw err;
      });
    });
  };
}

// TODO 可不可以不写死

var debug = true;

/**
* 动作类, 每一个动作流程都会创建一个动作实例，可以通过这个动作实例保存当前动作流程的局部变量
*/
var uid = 0;
var Action = function () {
  function Action(name) {
    classCallCheck(this, Action);

    this.name = name;
    this._uid = uid++;
    this.locals = {};
  }

  createClass(Action, [{
    key: 'get',
    value: function get(name) {
      return this.locals[name];
    }
  }, {
    key: 'set',
    value: function set(name, value) {
      this.locals[name] = value;
      return this;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.locals = {};
    }
  }]);
  return Action;
}();

Action.ValidateError = ValidateError;
Action.PersistError = PersistError;
Action.CancelActionError = CancelActionError;

/**
* buildin actions
*/
var buildInMethods = {
  create: makeActionValidatable('create'),
  update: makeActionValidatable('update'),
  destroy: makeAction('destroy'),
  get: makeAction('get'),
  getList: makeAction('getList')
};

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
function initActions(vm, options) {
  var actionPrefix = options.actionPrefix;


  var actionsOptions = vm.$options.actions;
  if (actionsOptions == null) return;

  var buildin = actionsOptions.buildin;
  var custom = actionsOptions.custom;

  var methods = {};

  // buildin actions
  if (Array.isArray(buildin)) {
    methods = pick.apply(undefined, [buildInMethods].concat(toConsumableArray(buildin)));
  } else if (buildin) {
    methods = _extends({}, buildInMethods);
  }

  // custom actions
  if (custom && isPlainObject(custom)) {
    for (var key in custom) {
      var value = custom[key];

      if (isPlainObject(value)) {
        // 预防未来添加更多的选项
        var persistMethodName = value.persistMethodName;
        var validatable = value.validatable;


        if (validatable) {
          // 添加验证钩子的动作
          methods[key] = makeActionValidatable(key, persistMethodName);
        } else {
          methods[key] = makeAction(key, persistMethodName);
        }
      } else {
        if (value) {
          // 添加验证钩子的动作
          methods[key] = makeActionValidatable(key);
        } else {
          methods[key] = makeAction(key);
        }
      }
    }
  }

  for (var _key in methods) {
    vm['' + actionPrefix + _key] = methods[_key].bind(vm);
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
  var capitalized = upperFirst(name),
      upperCased = name.toUpperCase();

  persistMethodName = persistMethodName || upperCased;

  return function resourceAction() {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var action = new Action(name);

    // ✅ 正常流程
    return this.$callHook('before' + capitalized, args, action).then(function (args) {
      //验证
      return _this.$callHook('on' + capitalized + 'Validate', args, action);
    }).then(function (args) {
      // 持久化前序
      return _this.$callHook('before' + upperCased, args, action);
    }).then(function (args) {
      // 开始持久化
      action.set('params', args[0]);
      return vuexActionWrapper(_this[persistMethodName], args, _this, upperCased);
    }).then(function (args) {
      // 持久化后序
      args.unshift(null);
      args[2] = action.get('params');
      return _this.$callHook('after' + upperCased, args, action);
    }).then(function (args) {
      // 动作完成
      args.unshift(null);
      return _this.$callHook('after' + capitalized, args, action);
    })
    // ❌ 错误处理, 后置钩子还用于错误处理
    .catch(function (err) {
      // 验证错误
      if (err instanceof ValidateError) {
        return _this.$callHook('after' + capitalized + 'Validate', [err], action);
      } else {
        throw err;
      }
    }).catch(function (err) {
      // 持久化错误
      if (err instanceof PersistError) {
        var _args = [err, null, action.get('params')];
        return _this.$callHook('after' + upperCased, _args, action);
      } else {
        // 未知错误
        throw err;
      }
    }).catch(function (err) {
      if (err instanceof CancelActionError) {
        if (debug) {
          console.warn('**Action**: (' + name + ') canceled!');
        }
        return _this.$callHook('after' + capitalized, [null], action);
      } else {
        throw err;
      }
    }).finally(function () {
      action.clear();
    });
  };
}

/**
* 不带验证的动作
* @param {String} name - action name
* @param {String} persistMethodName [name.toUpperCase()] - 持久化方法的名称，即vuex的action
*/
function makeAction(name, persistMethodName) {
  var capitalized = upperFirst(name),
      upperCased = name.toUpperCase();

  persistMethodName = persistMethodName || upperCased;

  return function resourceAction() {
    var _this2 = this;

    for (var _len2 = arguments.length, args = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var action = new Action(name);

    return this.$callHook('before' + capitalized, args, action).then(function (args) {
      // 持久化前序
      return _this2.$callHook('before' + upperCased, args, action);
    }).then(function (args) {
      // 开始持久化
      action.set('params', args[0]);
      return vuexActionWrapper(_this2[persistMethodName], args, _this2, upperCased);
    }).then(function (args) {
      // 持久化后序
      args.unshift(null);
      args[2] = action.get('params');
      return _this2.$callHook('after' + upperCased, args, action);
    }).then(function (args) {
      // 动作完成
      args.unshift(null);
      return _this2.$callHook('after' + capitalized, args, action);
    }).catch(function (err) {
      // 持久化错误
      if (err instanceof PersistError) {
        var _args2 = [err, null, action.get('params')];
        return _this2.$callHook('after' + upperCased, _args2, action);
      } else {
        // 未知错误
        throw err;
      }
    }).catch(function (err) {
      if (err instanceof CancelActionError) {
        if (debug) {
          console.warn('**Action**: (' + name + ') canceled!');
        }
        return _this2.$callHook('after' + capitalized, [null], action);
      } else {
        throw err;
      }
    }).finally(function () {
      action.clear();
    });
  };
}

/**
* 让vuex 的action 也符合钩子规范
* @param {Function} fn - 持久化动作
* @param {Array} args - 上一个钩子的载荷
* @param {Object} context - 动作执行的上下文
* @param {String} name - 动作名
*/
function vuexActionWrapper(fn) {
  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var context = arguments[2];
  var name = arguments[3];

  if (debug) {
    console.log('\uFF0APERSIST*: ' + name + ' --- payload: ', args);
  }

  if (fn) {
    return new Promise(function (resolve, reject) {
      args.push(function (err, data) {
        if (err) {
          if (err instanceof Error) {
            reject(new PersistError(err));
          } else {
            warn(debug, 'Callback Error: the first param of vuex action(' + name + ') callback must be a Error object or null.');
            resolve(err);
          }
        } else {
          resolve(data);
        }
      });

      var rt = fn.apply(context, args);

      // is promise
      if (rt && typeof rt.then === 'function') {
        rt.then(function (args) {
          resolve(args);
        }).catch(function (err) {
          reject(new PersistError(err));
        });
      }
    }).then(function (args) {
      if (args != void 0) {
        return [args];
      } else {
        return [];
      }
    });
  } else {
    warn(debug, 'Warning: ' + name + ' not implemented');
    // 不存在直接传递参数
    return Promise.resolve(args);
  }
}

/**
* 初始化动作
*/
function actionMixin(options) {
  debug = options.debug;
  return {
    init: function init() {
      initActions(this, options);
    }
  };
}

/**
*  用于新建可复用的钩子函数mixin
*/

var BASE_DRIVERS = {
  // do nothing
  default: function _default() {
    return {
      before: function before(payload, next) {
        next(payload);
      },
      after: function after(_ref, next) {
        var _ref2 = toArray(_ref);

        next();
      }
    };
  }
};

/**
* Hook 类用于生成钩子函数
*/

var Hook = function () {
  /**
  * @param {Object} defaultOptions - 默认参数
  *   一些重要的默认参数: name, effect, driver
  */
  function Hook(defaultOptions, isGetList) {
    classCallCheck(this, Hook);

    if (typeof isGetList !== 'boolean') {
      throw new TypeError('Hook Error: \'isGetList: boolean\' is required');
    }

    this.effects = {};
    this.drivers = _extends({}, BASE_DRIVERS);
    this.filters = [];
    this.defaultOptions = defaultOptions;
    this.isGetList = isGetList;
  }

  /**
  * 扩展持久化活动指示器
  */


  createClass(Hook, [{
    key: 'extendsEffects',
    value: function extendsEffects(effects) {
      this.effects = _extends({}, this.effects, effects);
      return this;
    }

    /**
    * 扩展动作驱动
    */

  }, {
    key: 'extendsDrivers',
    value: function extendsDrivers(drivers) {
      this.drivers = _extends({}, this.drivers, drivers);
      return this;
    }

    /**
    * 扩展过滤器。为了加强可定制性，genertateMixin生成的对象会经过一系列的过滤器.
    * filter不要改变原始mixins的值，而是对他进行扩展， 返回一个新的mixin
    */

  }, {
    key: 'extendsFilters',
    value: function extendsFilters(filters) {
      var _this = this;

      if (typeof filters === 'function') {
        this.filters.push(filters);
      } else if (Array.isArray(filters)) {
        filters.forEach(function (filter) {
          if (typeof filter === 'function') {
            _this.filters.push(filters);
          }
        });
      }
      return this;
    }

    /**
    * 让mixin经过filter的处理
    * @private
    */

  }, {
    key: 'reduce',
    value: function reduce(mixin, options) {
      var _this2 = this;

      if (mixin) {
        var result = this.filters.reduce(function (prev, curr) {
          return curr.call(_this2, prev, options);
        }, _extends({}, mixin));

        // 如果返回的是一个非法的mixin，将不对mixin进行修改
        if (!isPlainObject(mixin)) {
          throw new TypeError('Hook Error: filters result not a valid mixins');
        } else {
          mixin = result;
        }
      }

      return mixin;
    }

    /** 生成动作钩子
    * @param {Object} - 配置选项
    * @return {Object} - return beforeHook & afterHook
    */

  }, {
    key: 'generateActionHooks',
    value: function generateActionHooks(options) {
      var name = options.name;
      var capitalized = options.capitalized;
      var driver = options.driver;


      if (this.drivers[driver]) {
        var _ref3;

        var _drivers$driver = this.drivers[driver](options);

        var before = _drivers$driver.before;
        var after = _drivers$driver.after;

        return _ref3 = {}, defineProperty(_ref3, 'before' + capitalized, before), defineProperty(_ref3, 'after' + capitalized, after), _ref3;
      } else {
        throw new TypeError('Hook Error: unknow driver option: ' + driver);
      }
    }

    /** 生成持久化钩子
    * @param {Object} - 配置选项
    * @return {Object} - return beforeHOOK & afterHOOK
    */

  }, {
    key: 'generatePersistHooks',
    value: function generatePersistHooks(options) {
      var _ref8;

      var name = options.name;
      var upperCased = options.upperCased;
      var capitalized = options.capitalized;
      var effect = options.effect;
      var errorHandler = options.errorHandler;
      var dataHandler = options.dataHandler;

      var isGetList = this.isGetList;

      // 处理加载特效
      if (typeof effect === 'function') {
        var _effect = effect(options);

        var before = _effect.before;
        var after = _effect.after;

        if (typeof before !== 'function' || typeof after !== 'function') {
          throw new TypeError('Hook Error: If effect is a function, it must return a Object that contains two function(\'before\' & \'after\')');
        }
      } else if (this.effects[effect]) {
        var _effects$effect = this.effects[effect](options);

        var before = _effects$effect.before;
        var after = _effects$effect.after;
      } else {
        throw new TypeError('Hook Error: unknow effect option: ' + effect);
      }

      return _ref8 = {}, defineProperty(_ref8, 'before' + upperCased, function undefined(_ref4, next, action) {
        var _ref5 = toArray(_ref4);

        // 活动显示器
        before.apply(this, arguments);

        if (isGetList) {
          if (this.params) {
            next(this.params);
          } else {
            next(new TypeError('Hook Error: You must define \'params\' property in you \'data function\' for  ' + name + ' hooks'));
          }
        } else {
          next(this.actions[name].params);
        }
      }), defineProperty(_ref8, 'after' + upperCased, function undefined(_ref6, next, action) {
        var _ref7 = slicedToArray(_ref6, 2);

        var err = _ref7[0];
        var data = _ref7[1];


        // 关闭活动显示器
        after.apply(this, arguments);

        // 错误处理
        if (err) {
          if (typeof errorHandler === 'function') {
            errorHandler.apply(this, arguments);
          }
        } else if (typeof dataHandler === 'function') {
          dataHandler.apply(this, arguments);
        }

        next(data);
      }), _ref8;
    }

    // 生成数据模型

  }, {
    key: 'generateData',
    value: function generateData(options) {
      var name = options.name;
      var validatable = options.validatable;

      return function data() {
        return {
          actions: defineProperty({}, name, {
            validate: validatable ? {} : undefined,
            params: {},
            processing: []
          })
        };
      };
    }

    /** 一些钩子依赖可能依赖额外的mixin，用这个方法导入依赖的mixin
    * @abstract
    */

  }, {
    key: 'generateDependencies',
    value: function generateDependencies() {}

    /** 扩展的hooks
    * @abstract
    */

  }, {
    key: 'generateCustomHooks',
    value: function generateCustomHooks() {
      return {};
    }

    /**
    * 生成最后的mixin对象
    * @param {Object} options - 配置参数
    *    全局参数
    *    name: {String}             - '钩子名',
    *    effect: {String|Function}  - '活动指示器特效', 内置loader和processing
    *    driver: {String}           - 通过哪种方式进行更新
    *    loaderTitle: {String}      - loader的标题
    *    errorHandler: {Function}   - 错误处理器, 参数同after<HOOK>
    *    dataHandler: {Function}    - 数据处理器, 参数同after<HOOK>
    */

  }, {
    key: 'generateMixins',
    value: function generateMixins(options) {
      options = _extends({}, this.defaultOptions, options);

      var name = options.name,
          upperCased = options.upperCased = name.toUpperCase(),
          capitalized = options.capitalized = upperFirst(name);

      var mixin = {
        mixins: this.generateDependencies(options),
        data: this.generateData(options),
        hooks: _extends({}, this.generateActionHooks(options), this.generatePersistHooks(options), this.generateCustomHooks(options))
      };

      return this.reduce(mixin, options);
    }
  }]);
  return Hook;
}();

/**
* 实现hooks机制
*/
var Vue = void 0;

function install(_Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (Vue) {
    console.warn('vue-hooks already installed. Vue.use(VueHooks) should be called only once.');
    return;
  }
  Vue = _Vue;
  override(Vue, options);
}

function override(Vue, options) {
  options = _extends({
    debug: Vue.config.debug,
    actionPrefix: '$$'
  }, {
    options: options
  });

  /**
  * hooks 选项合并策略
  */
  Vue.config.optionMergeStrategies.hooks = Vue.config.optionMergeStrategies.methods;
  Vue.config.optionMergeStrategies.actions = function () {
    var toVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var fromVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (fromVal.buildin) {
      if (toVal.buildin) {
        fromVal.buildin.forEach(function (val) {
          if (toVal.buildin.indexOf(val) !== -1) {
            console.warn('Actions Warning: buildin conflict(' + val + '), to: ' + toVal.buildin + ', from: ' + fromVal.buildin + '. ');
          } else {
            toVal.buildin.push(val);
          }
        });
      } else {
        toVal.buildin = fromVal.buildin;
      }
    }

    if (fromVal.custom) {
      toVal.custom = _extends({}, fromVal.custom, toVal.custom || {});
    }
    return toVal;
  };

  Vue.mixin(methodsMixin(options));
  Vue.mixin(actionMixin(options));
  Vue.Hook = Hook;
}

return install;

})));
