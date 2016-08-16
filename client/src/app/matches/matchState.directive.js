/**
 * @ngdoc directive
 * @name feMatchState
 * @description
 * Displays whether match is in progress, complete or not started
 *
 */


(function () {
  'use strict';

  angular
    .module('frontendMatches')
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
