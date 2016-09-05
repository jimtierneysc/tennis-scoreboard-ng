/**
 * @ngdoc service
 * @name app.components.errorsHelper
 * @description
 * Add error processing to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .factory('errorsHelper', factory);

  /** @ngInject */
  function factory(errorsMapper) {
    return activate;

    /**
     * @ngdoc function
     * @name activate
     * @methodOf app.components.errorsHelper
     * @description
     * Adds members to a controller:
     * * errorsOfResponse()
     * * clearErrors()
     *
     * @param {Object} _vm_
     * Controller instance
     * @param {Object} errorsMap
     * Options to identify how errors should be handled:
     * * names
     * * map
     *
     * See {@link app.components.errorsMapper errorsMapper}.
     */
    function activate(_vm_, errorsMap) {
      // Initialize controller
      var vm = _vm_;
      /**
       * @ngdoc function
       * @name errorsOfResponse
       * @methodOf app.components.errorsHelper
       * @description
       * Categorize error messages from an HTTP response
       *
       * @param {Object} response
       * HTTP response
       * @returns {Object}
       * Hash of categorized error messages created by
       * {@link app.components.errorsMapper errorsMapper}
       */
      vm.errorsOfResponse = function (response) {
        var result;
        if (angular.isObject(response.data)) {
          var data = response.data;
          result = errorsMapper(data, errorsMap.names, errorsMap.map);
        }
        else
          result = errorsMapper({'errors': response.statusText ? response.statusText : 'Unexpected error'});
        return result;
      };
      /**
       * @ngdoc function
       * @name clearErrors
       * @methodOf app.components.errorsHelper
       * @description
       * Clear categories of errors.  Use, for example, to clear a "username" errors
       * when the user types in a different username.
       *
       * @param {Object} errors
       * Categories arrays
       * @param {Array} names
       * Names of categories to clear
       */
      vm.clearErrors = function(errors, names) {
        if (errors) {
          angular.forEach(names, function (name) {
            if (errors[name])
              errors[name] = null;
          });
        }
      };
    }
  }
})();




