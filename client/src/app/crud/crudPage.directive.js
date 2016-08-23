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
    .directive('feCrudPage', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      transclude: {
        'new': 'new',
        'list': 'list',
      },
      templateUrl: 'app/crud/crudPage.html',
      scope: {
        vm: '=',
        kind: '@'
      }
    };

    return directive;
  }
})();
