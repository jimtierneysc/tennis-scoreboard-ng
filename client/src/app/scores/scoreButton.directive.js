/**
 * @ngdoc directive
 * @name feScoreButton
 * @description
 * Button to change score
 *
 * @example:
 <fe-score-button></fe-score-button>
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreButton', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreButton.html',
      scope: {
        scores: '=',
        param: '=',
        view: '='
      }
    };

    return directive;
  }

})();
