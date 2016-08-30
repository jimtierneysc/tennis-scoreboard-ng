/**
 * @ngdoc directive
 * @name frontendCrud:feCrudPage
 * @restrict E
 * @description
 * Directive to display an entity page.
 * A page includes a (hidden) form to create a new entity, and
 * a list of entities.
 */
(function () {
  'use strict';

  angular
    .module('frontendCrud')
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
