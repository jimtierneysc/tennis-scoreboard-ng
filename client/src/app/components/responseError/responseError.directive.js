/**
 * @ngdoc directive
 * @name feResponseError
 * @description
 * Displays an http error response
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .directive('feResponseError', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/responseError/responseError.html',
      controller: Controller,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        error: '='
      }
    };

    return directive;
  }

  /** @ngInject */
  function Controller($scope, errorsMapper) {
    var vm = this;

    activate();

    function activate() {
      vm.status = function () {
        return vm.error.status;
      };
      vm.statusText = function () {
        return vm.error.statusText;
      };
      vm.message = responseMessage;

      vm.hasMessage = function () {
        return responseMessage()
      };
    }

    function responseMessage() {
      var data = vm.error.data;
      var result = null;
      if (data) {
        if (angular.isString(data)) {
          if (!isMarkup())
            result = data;
        }
        else if (angular.isObject(data)) {
          // Handle {somekey: ['some error message']}
          var errors = errorsMapper(data);
          result = errors.other[0];
        }
      }
      return result;

      function isMarkup() {
        return data.startsWith('<');
      }

    }
  }
})();
