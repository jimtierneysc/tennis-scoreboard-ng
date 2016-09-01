/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableSetTitle
 * @restrict E
 * @description
 * Display title of a set in the score table
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreTableSetTitle', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableSetTitle.html',
      scope: {
        set: '='
      }
    };

    return directive;
  }

})();
