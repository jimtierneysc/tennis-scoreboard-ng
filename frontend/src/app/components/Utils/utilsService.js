/**
 * @ngdoc service
 * @name controllerUtils
 * @description
 * Service to transfer player JSON between frontend and backend
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .service('feUtils', utilsFunc);

  /** @ngInject */
  function utilsFunc() {

    var vm = this;
    vm.normalizeObjectNames = normalizeObjectNames;


    // The map parameter is an object like:
    // { first: 'first_name', last: 'last_name' }
    // The data parameter is something like:
    // { firstName: [...], lastName: [...], xyz: [...] }
    // The result is this:
    // { first_name: [...], last_name: [...], other: [...] }
    // Because "firstName" contains "first", it is mapped to "first_name".
    function normalizeObjectNames(data, map) {
      var patt = "";

      // build pattern like 'key1|key2|key3|.'
      angular.forEach(map, function (value, key) {
        patt = patt + key + "|"
      });
      patt = patt + ".";
      var regExp = new RegExp(patt);
      var errors = {};
      angular.forEach(data, function (value, key) {
        var match = regExp.exec(key);
        var newKey = null;
        if (match) {
          match = match[0];
          if (angular.isDefined(map[match])) {
            newKey = map[match];
            if (newKey == null) {
              newKey = key;  // same key name
            }
          }
        }
        if (!newKey)
          newKey = 'other';  // catch all key name
        var arr = errors[newKey] || [];
        errors[newKey] = arr.concat(value);
      });
      return errors;
    }



  }
})();
