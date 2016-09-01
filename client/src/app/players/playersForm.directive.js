/**
 * @ngdoc directive
 * @name app.players.directive:fePlayersForm
 * @restrict E
 * @description
 * Form for adding a new player or editing an existing player.  The form has a name field.
 *
 */


(function () {
  'use strict';

  angular
    .module('app.players')
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
