/**
 * @ngdoc directive
 * @name app.crud.directive:feDeleteEntityButton
 * @restrict E
 * @description
 * Button to delete an entity
 *
 */

(function () {
  'use strict';

  angular
    .module('app.crud')
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
