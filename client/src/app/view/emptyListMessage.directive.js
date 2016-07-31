/**
 * @ngdoc directive
 * @name feEmptyListMessage
 * @description
 * Displays a message about an empty list
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendView')
    .directive('feEmptyListMessage', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/view/emptyListMessage.html',
      scope: {
        kind: '@',
        loggedIn: '='
      }
    };

    return directive;
  }
})();
