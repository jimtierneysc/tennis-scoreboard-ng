/**
 * @ngdoc directive
 * @name feScoreTableSelectServer
 * @description
 * Select the server when starting a new game
 */


(function () {
  'use strict';

  angular
    .module('frontendScores')
    .directive('feScoreTableSelectServer', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreTableSelectServer.html',
      scope: {
        scores: '=',
        view: '='
      }
    };

    return directive;
  }

})();
