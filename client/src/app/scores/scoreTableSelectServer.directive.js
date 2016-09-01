/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreTableSelectServer
 * @restrict E
 * @description
 * Select the server when starting a new game
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
