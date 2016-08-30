/**
 * @ngdoc directive
 * @name frontendCrud:feDeleteEntityButton
 * @restrict E
 * @description
 * Button to delete an entity
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendCrud')
    .directive('feDeleteEntityButton', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/crud/deleteEntityButton.html',
      scope: {
        entity: '=',
        deleteEntity: '&'
      }
    };

    return directive;
  }
})();
