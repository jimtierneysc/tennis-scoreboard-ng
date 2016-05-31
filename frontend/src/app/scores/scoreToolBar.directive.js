/**
 * @ngdoc directive
 * @name feScoreToolBar
 * @description
 * Buttons to change view
 *
 * @example:
 <fe-score-tool-bar></fe-score-tool-bar>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feScoreToolBar', directiveFunc);

  /** @ngInject */
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/scoreToolBar.html',
      scope: {
        scores: '='
      }

    };

    return directive;
  }

})();
