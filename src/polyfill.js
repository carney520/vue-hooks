/**
* Promise polyfills
*/
if (typeof Promise !== 'function' && typeof Promise !== 'object') {
  throw "Cannot polyfill Promise when it is " + JSON.stringify(Promise);
}

if (typeof Promise.prototype.done !== 'function') {
  var rejectByThrowing = (err) => {
    setTimeout(() => { throw err }, 0);
  };

  Promise.prototype.done = function() {
    this.then.apply(this, arguments).then(null, rejectByThrowing);
  };
}

if (typeof Promise.prototype.finally !== 'function') {
  Promise.prototype.finally = function (callback) {
    return this.then(
      value => Promise.resolve(callback()).then(() => value),
      err => Promise.resolve(callback()).then(() =>  {throw err})
    )
  }
}
