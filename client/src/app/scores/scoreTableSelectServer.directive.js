/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableSelectServer
 * @restrict E
 * @description
 * Display a form for selecting the player to serve in the next game
 */


(function () {
  'use strict';

  angular
    .module('app.scores')
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
