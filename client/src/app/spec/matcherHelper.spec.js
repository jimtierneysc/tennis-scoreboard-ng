
/*exported MatcherHelper*/
function MatcherHelper(_vm_) {
  'use strict';
  
  var vm = _vm_;
  this.checkObject = checkObject;
  this.checkBoolean = checkBoolean;
  this.checkString = checkString;
  this.checkFunction = checkFunction;
  this.getResult = getResult;
  this.fail = fail;
  
  var pass = true;
  var messages = [];

  function fail(message) {
    messages.push(message);
    pass = false;
  }

  function checkFunction(name, required) {
    checkType(name, "function", required);
  }

  function checkObject(name, required) {
    checkType(name, "object", required);
  }

  function checkBoolean(name, required) {
    checkType(name, "boolean", required);
  }

  function checkString(name, required) {
    checkType(name, "string", required);
  }

  function checkType(name, type, required) {
    if (angular.isUndefined(required))
      required = true;
    var member = vm[name];
    if (required || member)
      if (typeof member != type)
        fail('expect ' + type + ' ' + name);
  }
  
  function getResult() {
    return {
      pass: pass,
    message: messages
    }
  }

}
