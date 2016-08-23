/**
 * @ngdoc directive
 * @name fePlayersForm
 * @description
 * Form for new player and edit player
 *
 */


(function () {
  'use strict';

  angular
    .module('frontendPlayers')
    .directive('fePlayersForm', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/players/playersForm.html',
      scope: {
        vm: '='
      }
    };

    return directive;
  }

})();
