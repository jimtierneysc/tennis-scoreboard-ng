/**
 * @ngdoc directive
 * @name app.matches.directive:feMatchState
 * @restrict E
 * @description
 * Displays a message about the state of the match (in progress, complete or not started)
 *
 */

(function () {
  'use strict';

  angular
    .module('app.matches')
    .directive('feMatchState', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchState.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }

})();
