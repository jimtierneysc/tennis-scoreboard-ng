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
    .module('frontendCrud')
    .directive('feCrudRow', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      transclude: {
        'edit': 'section',
        'entity': 'main',
        'links': '?nav'
      },
      templateUrl: 'app/crud/crudRow.html',
      scope: {
        editEntity: '=',
        entityList: '=',
        entity: '='
      }
    };

    return directive;
  }
})();
