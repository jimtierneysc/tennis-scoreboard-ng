/**
 * @ngdoc directive
 * @name app.components.directive:feWaitIndicator
 * @restrict E
 * @description
 * Display animation while waiting
 *
 */

(function () {
  'use strict';

  angular
    .module('app.components')
    .directive('feWaitIndicator', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/waitIndicator/waitIndicator.html',
      controller: Controller,
      controllerAs: 'vm'
    };

    return directive;
  }

  /** @ngInject */
  function Controller(waitIndicator, $scope, $timeout, waitInterval) {
    var vm = this;
    vm.waiting = false;

    activate();

    function activate() {
      waitIndicator.subscribeChanged($scope, changed);
    }

    function changed() {
      if (waitIndicator.waiting()) {
        // Wait before showing indicator
        var timer = $timeout(function () {
            vm.waiting = waitIndicator.waiting();
          },
          waitInterval);
        $scope.$on('$destroy', function() {
          $timeout.cancel(timer);
        });
      }
      else
        vm.waiting = false;
    }
  }
})();
