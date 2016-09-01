/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableGameTitle
 * @restrict E
 * @description
 * Display title of a game in the score table
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTableGameTitle', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableGameTitle.html',
      scope: {
        game: '='
      }
    };

    return directive;
  }

})();
