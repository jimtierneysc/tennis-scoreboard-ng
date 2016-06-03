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
    .module('frontend')
    .directive('feScoreButton', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/scoreButton.html',
      scope: {
        scores: '=',
        param: '=',
        title: '='
      }
    };

    return directive;
  }

})();
