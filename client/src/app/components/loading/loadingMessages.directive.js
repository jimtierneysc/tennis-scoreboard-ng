/**
 * @ngdoc directive
 * @name feLoadingMessage
 * @description
 * Displays message about loading
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .directive('feLoadingMessages', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/loading/loadingMessages.html',
      scope: {
        loading: '='
      }
    };

    return directive;
  }
})();
