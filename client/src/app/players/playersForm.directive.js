/**
 * @ngdoc directive
 * @name fePlayersForm
 * @restrict E
 * @description
 * Form for adding a new player and editing an existing player
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
