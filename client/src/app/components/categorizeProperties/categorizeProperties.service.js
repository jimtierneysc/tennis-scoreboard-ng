/**
 * @ngdoc service
 * @name categorizeProperties
 * @description
 * Group properties together.  The map
 * parameter identifies the groups.  if
 * there is no matching group, then 'other' is used.
 * For example, if the map parameter is this:
 * { first: 'first_name', last: null }
 * and, if the data parameter is this:
 * { firstName: ['f1'], first['f2'], last: ['la'], xyz: ['x'] }
 * then the result is this:
 * { first_name: ['f1', 'f2'], last: ['la'], other: ['x'] }
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('categorizeProperties', Service);

  /** @ngInject */
  function Service() {

    // var service = this;
    // service.categorizeProperties = categorizeProperties

    return categorizeProperties;

    function categorizeProperties(data, map) {
      var patt = "";

      // build pattern like 'key1|key2|key3|.'
      angular.forEach(map, function (value, key) {
        patt = patt + key + "|"
      });
      patt = patt + ".";
      var regExp = new RegExp(patt);
      var result = {};
      angular.forEach(data, function (value, key) {
        var match = regExp.exec(key);
        var newKey = null;
        if (match) {
          match = match[0];
          if (map && angular.isDefined(map[match])) {
            newKey = map[match];
            if (newKey == null) {
              newKey = key;  // same key name
            }
          }
        }
        if (!newKey)
          newKey = 'other';  // default key name
        var arr = result[newKey] || [];
        result[newKey] = arr.concat(value);
      });
      return result;
    }

  }
})();
