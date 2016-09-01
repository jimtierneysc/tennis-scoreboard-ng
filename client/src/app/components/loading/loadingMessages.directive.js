/**
 * @ngdoc directive
 * @name app.components.directive:feLoadingMessage
 * @restrict E
 * @description
 * Displays message about loading
 *
 */

(function () {
  'use strict';

  angular
    .module('app.components')
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
