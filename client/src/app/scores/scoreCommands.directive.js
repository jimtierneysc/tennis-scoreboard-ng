/**
 * @ngdoc directive
 * @name feScoreCommands
 * @restrict E
 * @description
 * Commands to change view
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
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
