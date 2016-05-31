/**
 * @ngdoc directive
 * @name feMatchPlayDescription
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
    .directive('feMatchPlayDescription', directiveFunc);

  /** @ngInject */
  function directiveFunc($log) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/scores/matchPlayDescription.html',
      scope: {
        match: '='
      },
      link: function (scope, elem) {
        $log.info('link');
      }

    };

    return directive;
  }

})();
