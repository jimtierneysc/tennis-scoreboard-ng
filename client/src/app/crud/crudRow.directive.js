/**
 * @ngdoc directive
 * @name app.crud.directive:feCrudRow
 * @restrict E
 * @description
 * Directive to display an entity row.
 * An entity row contains the entity data, a (hidden) edit form,
 * and buttons to delete and edit the entity.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.crud')
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
