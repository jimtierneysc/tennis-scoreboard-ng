/**
 * @ngdoc service
 * @name feUtils
 * @description
 * Utility functions
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
    vm.categorizeProperties = categorizeProperties;
    vm.escapeHtml = escapeHtml;
    


    // Group properties together.  The map
    // parameter identifies the groups.  'Other' is the
    // default group.
    // If the map parameter is this:
    // { first: 'first_name', last: null }
    // If the data parameter is this:
    // { firstName: ['f1'], first['f2'], last: ['la'], xyz: ['x'] }
    // Then the result is this:
    // { first_name: ['f1', 'f2'], last: ['la'], other: ['x'] }
    function categorizeProperties(data, map) {
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

    /* global _ */
    function escapeHtml(text) {
      return _.escape(text);
    }

  }
})();
