/**
 * @ngdoc directive
 * @name feScorePanel
 * @description
 * Display controls to play match
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScorePanel', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scorePanel.html',
      scope: {
        scores: '=',
        view: '=',
        updating: '=',
        loggedIn: '='
      }
    };

    return directive;
  }

})();
