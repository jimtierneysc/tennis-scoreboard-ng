/**
 * @ngdoc directive
 * @name feMatchDetails
 * @description
 * Displays information about the match
 *
 */


(function () {
  'use strict';

  angular
    .module('frontendMatches')
    .directive('feMatchDetails', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/matches/matchDetails.html',
      scope: {
        match: '='
      }
    };

    return directive;
  }

})();
