/**
 * @ngdoc service
 * @name app.components.errorsMapper
 * @description
 * Categorize error messages in a hash
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .factory('errorsMapper', factory);

  /** @ngInject */
  function factory() {

    return errorsMapper;

    /**
     * @ngdoc service
     * @name errorsMapper
     * @methodOf app.components.errorsMapper
     * @description
     * Given a hash, return a new hash that groups values together.  Useful for
     * processing the errors generated by Rails.
     * @param {Object} data
     * Input hash.  Values are expected to be strings or string arrays.
     * @param {Array} names
     * Key names to copy.
     * @param {Object} map
     * Map original key names to new key names.
     * @param {String} defaultKey
     * Key name to use for all of the errors that don't match a known key name (in names param).
     * Each value will be prefixed with the original key name.
     */
    function errorsMapper(data, names, map, defaultKey) {
      names = names || [];
      map = map || {};
      defaultKey = defaultKey || 'other';

      if (angular.isObject(data.errors))
        // handle nested errors object
        data = data.errors;

      var result = {};
      angular.forEach(data, function (value, key) {
        var newKey = matchKeyName(key);
        var messages = [];
        if (newKey == null) {
          newKey = defaultKey;
          appendMessages(messages, value, makePrefix(key));
        }
        else {
          appendMessages(messages, value);  // no prefix
        }

        var arr = result[newKey] || [];
        result[newKey] = arr.concat(messages);
      });
      return result;

      function matchKeyName(key) {
        var newKey = null;
        var i = names.indexOf(key);
        if (i >= 0) {
          var match = names[i];
          if (angular.isDefined(map[match]))
            newKey = map[match];
          else
            newKey = match;
        }
        return newKey;
      }

      function appendMessages(messages, value, prefix) {
        prefix = prefix || '';
        if (typeof value == "object")
          angular.forEach(value, function (el) {
            messages.push(prefix + el)
          });
        else
          messages.push(prefix + value);
      }

      function makePrefix(key) {
        var result = key;
        if (result.length > 0) {
          var notAPrefix = [defaultKey, 'errors', 'error'];
          if (notAPrefix.indexOf(key) >= 0)
            result = '';
          else {
            if (result.slice(-3) == '_id')
              result = result.slice(0, result.length - 3);
            result = result.replace(/_/g, ' ');
            result = result.charAt(0).toUpperCase() + result.slice(1);
            result = result + ' ';
          }
        }

        return result;
      }
    }
  }
})();
