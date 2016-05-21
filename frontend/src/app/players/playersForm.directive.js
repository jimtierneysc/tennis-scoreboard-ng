/**
 * @ngdoc directive
 * @name fePlayer
 * @description
 * Form for new player and editing player
 *
 * @example:
 <fe-players-form></fe-players-form>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('fePlayersForm', directiveFunc);

  /** @ngInject */
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/players/playersForm.html',
      scope: {
        form: '=',
        errors: '=',
        cancel: '&',
        submit: '&',
        entity: '=',
        ok: '@'
      },
      link: function (scope, elem) {
        $log.info('link');
      }

    };

    return directive;
  }

})();
