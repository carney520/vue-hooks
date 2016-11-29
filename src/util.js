/**
* 首字母大写
*/
export function upperFirst (string) {
  if (string.length > 1) {
    return string.slice(0, 1).toUpperCase() + string.slice(1)
  } else {
    return string
  }
}

/**
* 输出警告信息
*/
export function warn (debug, message) {
  if (debug) {
    console.warn(message)
    console.trace && console.trace()
  }
}

export function pick (obj, ...keys) {
  let result = {}
  if (obj == null) return result

  keys.forEach(key => {
    result[key] = obj[key]
  })

  return result
}

/**
 * thanks lodash
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]'

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
  var result = false
  if (value != null && typeof value.toString !== 'function') {
    try {
      result = !!(value + '')
    } catch (e) {}
  }
  return result
}

/** Used for built-in method references. */
var objectProto = Object.prototype

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object)

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString

/** Built-in value references. */
var getPrototypeOf = Object.getPrototypeOf

export function isObjectLike (value) {
  return !!value && typeof value === 'object'
}

export function isPlainObject (value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) !== objectTag || isHostObject(value)) {
    return false
  }
  var proto = getPrototypeOf(value)
  if (proto === null) {
    return true
  }
  var Ctor = proto.constructor
  return (typeof Ctor === 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString)
}
