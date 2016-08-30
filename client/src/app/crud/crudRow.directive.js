/**
 * @ngdoc directive
 * @name frontendCrud:feCrudRow
 * @restrict E
 * @description
 * Directive to display an entity row.
 * A row includes the entity data, a (hidden) edit form, 
 * and buttons to delete and edit the entity.
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
