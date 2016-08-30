/**
 * @ngdoc directive
 * @name frontendCrud:feEditEntityButton
 * @restrict E
 * @description
 * Button to edit an entity
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
