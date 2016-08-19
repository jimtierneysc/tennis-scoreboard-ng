/**
 * @ngdoc directive
 * @name feDeleteEntityButton
 * @description
 * Button to delete player, match or team
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendView')
    .directive('feDeleteEntityButton', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/view/deleteEntityButton.html',
      scope: {
        entity: '=',
        deleteEntity: '&'
      }
    };

    return directive;
  }
})();