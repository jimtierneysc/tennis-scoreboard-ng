/**
 * @ngdoc directive
 * @name feScoreToolBar
 * @description
 * Buttons to change view
 *
 * @example:
 <fe-score-commands></fe-score-commands>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feScoreCommands', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreCommands.html',
      scope: {
        scores: '=',
        view: '=',
        loggedin: '='
      }

    };

    return directive;
  }

})();
