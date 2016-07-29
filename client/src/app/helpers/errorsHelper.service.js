/**
 * @ngdoc factory
 * @name errorsHelper
 * @description
 * Add error processing to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendHelpers')
    .factory('errorsHelper', factory);

  /** @ngInject */
  function factory($log, errorsMapper) {
    return activate;

    function activate(_vm_, errorsMap) {
      // Initialize controller
      var vm = _vm_;
      vm.errorsOfResponse = function (response) {
        var result;
        if (angular.isObject(response.data)) {
          var data = response.data;
          if (angular.isObject(data.errors))
            data = data.errors;
          result = errorsMapper(data, errorsMap.names, errorsMap.map);
        }
        else
          result = errorsMapper({'Status': response.statusText ? response.statusText : 'unexpected error'});
        return result;
      };
    }

  }
})();




