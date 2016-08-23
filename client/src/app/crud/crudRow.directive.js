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
        'edit': 'edit',
        'entity': 'entity',
        'links': '?links'
      },
      templateUrl: 'app/crud/crudRow.html',
      scope: {
        vm: '=',
        entity: '='
      }
    };

    return directive;
  }
})();
