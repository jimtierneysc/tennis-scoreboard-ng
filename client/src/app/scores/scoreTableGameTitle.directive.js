/**
 * @ngdoc directive
 * @name feScoreTableGameTitle
 * @description
 * Display title of a game in the score table
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableGameTitle', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableGameTitle.html',
      scope: {
        game: '=',
        view: '=',
      }
    };

    return directive;
  }

})();
