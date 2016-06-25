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
    .directive('feScoreCommands', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/scoreCommands.html',
      scope: {
        scores: '=',
        loggedin: '='
      }

    };

    return directive;
  }

})();
