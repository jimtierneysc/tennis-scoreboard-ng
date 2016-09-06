/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTable
 * @restrict E
 * @description
 * Display a table with the names of the opponents,
 * the match score, the set scores, and (optionally) the
 * completed games.  When the end user is keeping score, the table
 * will include some buttons to start a game and win a game.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTable', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTable.html',
      scope: {
        scores: '=',
        view: '='
      }
    };

    return directive;
  }

})();
