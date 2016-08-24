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
    .module('frontendComponents')
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
          result = errorsMapper(data, errorsMap.names, errorsMap.map);
        }
        else
          result = errorsMapper({'errors': response.statusText ? response.statusText : 'Unexpected error'});
        return result;
      };
    }
  }
})();




