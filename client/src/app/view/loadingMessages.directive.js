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
    .module('frontendView')
    .directive('feLoadingMessages', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/view/loadingMessages.html',
      scope: {
        loading: '=',
        error: '=',
        failed: '='
      }
    };

    return directive;
  }
})();
