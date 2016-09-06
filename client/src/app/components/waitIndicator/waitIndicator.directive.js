/**
 * @ngdoc directive
 * @name app.components.directive:feWaitIndicator
 * @restrict E
 * @description
 * Displays a spinner when the application is in a waiting state
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
  function Controller(waitingState, $scope, $timeout, waitInterval) {
    var vm = this;
    vm.waiting = false;

    activate();

    function activate() {
      waitingState.subscribeChanged($scope, changed);
    }

    function changed() {
      if (waitingState.waiting()) {
        // Wait before showing indicator
        var timer = $timeout(function () {
            vm.waiting = waitingState.waiting();
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
