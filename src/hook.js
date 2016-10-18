/**
*  用于新建可复用的钩子函数mixin
*/

import { upperFirst, isPlainObject } from './util'

const BASE_DRIVERS = {
  // do nothing
  default () {
    return {
      before (payload, next) {
        next(payload)
      },

      after ([], next) {
        next()
      },
    }
  },
}

/**
* Hook 类用于生成钩子函数
*/
export default class Hook {
  /**
  * @param {Object} defaultOptions - 默认参数
  *   一些重要的默认参数: name, effect, driver
  */
  constructor (defaultOptions, isGetList) {
    if (typeof isGetList !== 'boolean') {
      throw new TypeError(`Hook Error: 'isGetList: boolean' is required`)
    }

    this.effects = {}
    this.drivers = {...BASE_DRIVERS}
    this.filters = []
    this.defaultOptions = defaultOptions
    this.isGetList = isGetList
  }

  /**
  * 扩展持久化活动指示器
  */
  extendsEffects (effects) {
    this.effects = {...this.effects, ...effects}
    return this
  }

  /**
  * 扩展动作驱动
  */
  extendsDrivers (drivers) {
    this.drivers = {...this.drivers, ...drivers}
    return this
  }

  /**
  * 扩展过滤器。为了加强可定制性，genertateMixin生成的对象会经过一系列的过滤器.
  * filter不要改变原始mixins的值，而是对他进行扩展， 返回一个新的mixin
  */
  extendsFilters (filters) {
    if (typeof filters === 'function') {
      this.filters.push(filters)
    } else if (Array.isArray(filters)) {
      filters.forEach(filter => {
        if (typeof filter === 'function') {
          this.filters.push(filters)
        }
      })
    }
    return this
  }

  /**
  * 让mixin经过filter的处理
  * @private
  */
  reduce (mixin, options) {
    if (mixin) {
      let result = this.filters.reduce((prev, curr) => {
        return curr.call(this, prev, options)
      }, {...mixin})

      // 如果返回的是一个非法的mixin，将不对mixin进行修改
      if (!isPlainObject(mixin)) {
        throw new TypeError('Hook Error: filters result not a valid mixins')
      } else {
        mixin = result
      }
    }

    return mixin
  }

  /** 生成动作钩子
  * @param {Object} - 配置选项
  * @return {Object} - return beforeHook & afterHook
  */
  generateActionHooks (options) {
    const { name, capitalized, driver} = options

    if (this.drivers[driver]) {
      const {before, after} = this.drivers[driver](options)
      return {
        [`before${capitalized}`]: before,
        [`after${capitalized}`]: after,
      }
    } else {
      throw new TypeError(`Hook Error: unknow driver option: ${driver}`)
    }
  }

  /** 生成持久化钩子
  * @param {Object} - 配置选项
  * @return {Object} - return beforeHOOK & afterHOOK
  */
  generatePersistHooks (options) {
    const {
      name,
      upperCased,
      capitalized,
      effect,
      errorHandler,
      dataHandler,
     } = options
    const isGetList = this.isGetList

    // 处理加载特效
    if (typeof effect === 'function') {
      var {before, after} = effect(options)
      if (typeof before !== 'function' || typeof after !== 'function') {
        throw new TypeError(`Hook Error: If effect is a function, it must return a Object that contains two function('before' & 'after')`)
      }

    } else if(this.effects[effect]){
      var {before, after} = this.effects[effect](options)
    } else {
      throw new TypeError(`Hook Error: unknow effect option: ${effect}`)
    }

    return {
      [`before${upperCased}`] ([], next, action) {
        // 活动显示器
        before.apply(this, arguments)

        if (isGetList) {
          if (this.params) {
            next(this.params)
          } else {
            next(new TypeError(`Hook Error: You must define 'params' property in you 'data function' for  ${name} hooks`))
          }
        } else {
          next(this.actions[name].params)
        }
      },

      [`after${upperCased}`] ([err, data], next, action) {

        // 关闭活动显示器
        after.apply(this, arguments)

        // 错误处理
        if (err) {
          if (typeof errorHandler === 'function') {
            errorHandler.apply(this, arguments)
          }
        } else if(typeof dataHandler === 'function') {
          dataHandler.apply(this, arguments)
        }

        next(data)
      }
    }
  }

  // 生成数据模型
  generateData (options) {
    const { name, validatable } = options
    return function data () {
      return {
        actions: {
          [name]: {
            validate: validatable ? {} : undefined,
            params: {},
            processing: [],
          }
        }
      }
    }
  }

  /** 一些钩子依赖可能依赖额外的mixin，用这个方法导入依赖的mixin
  * @abstract
  */
  generateDependencies () {
  }

  /** 扩展的hooks
  * @abstract
  */
  generateCustomHooks () {
    return {}
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
  generateMixins (options) {
    options = {...this.defaultOptions, ...options}

    const name = options.name,
        upperCased = options.upperCased =  name.toUpperCase(),
        capitalized = options.capitalized = upperFirst(name)

    const mixin =  {
      mixins: this.generateDependencies(options),
      data: this.generateData(options),
      hooks: {
        ...this.generateActionHooks(options),
        ...this.generatePersistHooks(options),
        ...this.generateCustomHooks(options),
      },
    }

    return this.reduce(mixin, options)
  }
}
