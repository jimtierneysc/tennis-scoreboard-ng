/**
 * @ngdoc directive
 * @name feWaitIndicator
 * @description
 * Display animation while waiting
 *
 * @example:
 <fe-wait-indicator></fe-wait-indicator>
 */


(function () {
  'use strict';

  angular
    .module('frontend')
    .directive('feWaitIndicator', directiveFunc);

  /** @ngInject */
  function directiveFunc() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'app/components/waitIndicator/waitIndicator.html',
      controller: controllerFunc,
      controllerAs: 'vm'
    };

    return directive;
  }

  /** @ngInject */
  function controllerFunc(waitIndicator, $scope, $timeout) {
    var vm = this;
    vm.waiting = false;

    activate();

    function activate() {
      waitIndicator.subscribeChanged($scope, changed);
    }

    function changed() {
      if (waitIndicator.waiting()) {
        $timeout(function () {
            // Wait a second before showing wait indicator
            vm.waiting = waitIndicator.waiting();
          },
          1000);
      }
      else
        vm.waiting = false;
    }
  }


})();
