/**
 * @ngdoc directive
 * @name feScoreCommands
 * @description
 * Commands to change view
 *
 * @example:
 <fe-score-commands></fe-score-commands>
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