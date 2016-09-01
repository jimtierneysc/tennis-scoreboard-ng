/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreCommands
 * @restrict E
 * @description
 * Commands to change view
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreCommands', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreCommands.html',
      scope: {
        vm: '=',
        loggedIn: '='
      }

    };

    return directive;
  }

})();
