/**
 * @ngdoc directive
 * @name feEditEntityButton
 * @description
 * Button to edit player, match or team
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendCrud')
    .directive('feEditEntityButton', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/crud/editEntityButton.html',
      scope: {
        entity: '=',
        disable:'=',
        editEntity: '&'
      }
    };

    return directive;
  }
})();
