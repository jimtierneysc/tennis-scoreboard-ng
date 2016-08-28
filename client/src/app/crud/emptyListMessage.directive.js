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
    .module('frontendCrud')
    .directive('feEmptyListMessage', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/crud/emptyListMessage.html',
      scope: {
        kind: '@',
        loggedIn: '='
      }
    };

    return directive;
  }
})();