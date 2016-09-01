/**
 * @ngdoc directive
 * @name app.crud.directive:feEmptyListMessage
 * @restrict E
 * @description
 * Displays a message about an empty entity list
 *
 */

(function () {
  'use strict';

  angular
    .module('app.crud')
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
