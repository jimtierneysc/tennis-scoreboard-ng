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
    .module('frontendView')
    .directive('feEditEntityButton', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/view/editEntityButton.html',
      scope: {
        entity: '=',
        disable:'=',
        editEntity: '&'
      }
    };

    return directive;
  }
})();
