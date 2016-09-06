/**
 * @ngdoc directive
 * @name app.crud.directive:feCrudPage
 * @restrict E
 * @description
 * Directive to display an entity page.
 * An entity page contains a (hidden) form to create a new entity, and
 * a list of entities.
 */
(function () {
  'use strict';

  angular
    .module('app.crud')
    .directive('feCrudPage', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      transclude: {
        'new': 'section',
        'list': 'main'
      },
      templateUrl: 'app/crud/crudPage.html',
      scope: {
        loading: '=',
        newEntity: '=',
        entityList: '='
      }
    };

    return directive;
  }
})();
