/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreButton
 * @restrict E
 * @description
 * Button to change score
 *
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
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
