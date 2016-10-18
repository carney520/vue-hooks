# 钩子机制的一个实现

## 安装
```
  import Vue from 'vue'
  import VueHooks from 'helpers/plugins/vue-hooks'
  Vue.use(VueHooks)
```

### 定义动作
```
  export default {
    // 定义动作
    actions: {
      buildin: ['getList', 'destroy'], // 筛选内置动作
      custom: {                        // 自定义动作
        'foo': {
          validatable: true,           // 添加了验证钩子的动作
          persistMethodName: 'FOO',    // 对应的持久化方法
        }
      }
    },

    // 定义持久化方法
    vuex: {
      actions: {
        GETLIST: getUserList,
        DESTROY: destroyUser,
        FOO: fooUser,
      }
    },
  }
```

这样vue-hooks 就会混入 `$$getList`, `$$destroy`, `$$foo` 方法（动作）。比如调用`$$destroy` 会经过这些钩子：

+ beforeDestroy 动作钩子, 用于删除的准备动作， 比如显示确认框
+ beforeDESTROY 持久化钩子，在持久化之前的一些准备动作， 比如准备请求参数, 显示正在请求的spin
+ DESTROY 调用持久化方法， 这里规定所有持久化方法的方法名都为大写
+ afterDESTROY 持久化后置钩子，如果请求成功则对请求的数据进行处理，如果请求失败，则处理错误
+ afterDestroy 动作结束

### 定义钩子

```
  export default {
    // 定义数据模型，按照actions.<actionName>.params 的形式声明
    data () {
      return {
        actions: {
          destroy: {
            params: {}
          },
        },
      }
    },

    //...
    hooks: {
      // 每个钩子函数都接受三个参数， 第一个参数是payload(载荷，数组形式), 第二个是next回调，调用进行下一步,
      // 第三个参数是动作实例，可以调用set(name, value),get(name) 进行动作局部数据存储
      beforeDestroy ([item, index], next, action) {
        this.$showConfirm('警告', '确认删除？', () => {
          // 确认删除, next 还可以接受参数，这些参数会传递给下一个钩子，即beforeDESTROY
          next({id: item.id, index})
        }, () => {
          // 动作取消， 需要显示取消动作，避免内存溢出
          next.cancel()
        })
      },

      beforeDESTROY ([params], next) {
        this.$showLoader('正在删除')
        // params 最后会传递给 DESTROY方法
        next(params)
      },

      // 后置钩子的载荷比较特殊，第一参数是err，错误对象，可以通过它来判断持久化是否出错
      afterDESTROY([err, data], next) {
        if (err) {
          this.alert('删除失败')
        } else {
          this.alert('删除成功')
        }
        // 所有动作要么错误，要么成功，不能一直处于pending状态，即一定要调用next() 或 next.cancel(), 避免内存溢出
        next()
      },

      afterDestroy ([], next) {
        // 动作结束
        next()
      },
    },
  }
```

### 视图触发动作
首先我们来定义view， 来触发动作:
```
<template lang="jade">
  ul
    li(v-for="user of users")
      span {{ user.name }}
      button(@click="$$destroy(item, index)") 删除
</template>
```
现在你可以想象用户点击删除按钮发生的流程:

```
  UI 事件
  ⬇︎
  $$destroy(item, index)
  ⬇︎
  beforeDestroy([item, index])
  ⬇︎
  beforeDESTROY([params])
  ⬇︎
  DESTROY(params)
  ⬇︎
  afterDESTROY([err, data])
  ⬇︎
  afterDestroy([])
```

几乎所有的数据操作都可以抽象为一个`动作`, 它的流程是固定的，变化的是流程中的环节。而这些环节几乎在不同页面也是重复的, 我们可以将页面之间共享的钩子抽离出来，以mixins的形式注入， 页面也可以针对性地实现自己特殊的钩子，覆盖共享的钩子。

通过钩子机制，可以增强业务逻辑的复用，减少代码的重复。另外也增强了可维护性和可调试型， 我们可以监视钩子之间的数据传递，很容易就可以找到异常的环节。

### 可验证的钩子
一些数据操作，比如创建资源， 更新资源，在持久化之前需要验证器数据的合法性。这类动作比普通动作新增了一个数据验证的环节。它们的钩子看起来像：

```
  UI 事件
  ⬇︎
  $$update
  ⬇︎
  beforeUpdate
  ⬇︎
  onUpdateValidate
  ⬇︎
  beforeUPDATE
  ⬇︎
  UPDATE
  ⬇︎
  afterUPDATE
  ⬇︎
  afterUpdate
```
### 定义复用的钩子函数mixin
vue-hooks 还定义了一个Hook类，用来创建钩子函数mixin, 其中包含了许多约定(约定大于配置)

TODO
