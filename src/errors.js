/**
* 使得babel 可以继承JS内置类，比如Error，Array
* @link http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
*/
export function ExtendableBuiltin(cls){
    function ExtendableBuiltin(){
        cls.apply(this, arguments);
    }
    ExtendableBuiltin.prototype = Object.create(cls.prototype);
    Object.setPrototypeOf(ExtendableBuiltin, cls);

    return ExtendableBuiltin;
}

export class ValidateError extends ExtendableBuiltin(Error) {
  constructor (message) {
    super(message)
    this.message = message
    this.name = "ValidateError"
    this.stack = (new Error()).stack
  }
}

export class PersistError extends ExtendableBuiltin(Error) {
  constructor (data) {
    if (data instanceof Error) {
      super(data.message)
      Object.assign(this, data)
      this.message = data.message
    } else {
      super(data)
      this.message = data
    }
    this.name = 'PersistError'
    this.stack = (new Error()).stack
  }
}

/**
* 如果要中断动作流程时抛出此错误
*/
export class CancelActionError extends ExtendableBuiltin(Error) {
  constructor (message) {
    super(message)
    this.name = 'CancelActionError'
    this.message = message
  }
}
