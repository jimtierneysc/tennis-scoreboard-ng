/**
 * @ngdoc directive
 * @name feWaitIndicator
 * @description
 * Display animation while waiting
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
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
  function Controller(waitIndicator, $scope, $timeout) {
    var vm = this;
    vm.waiting = false;

    activate();

    function activate() {
      waitIndicator.subscribeChanged($scope, changed);
    }

    function changed() {
      if (waitIndicator.waiting()) {
        var timer = $timeout(function () {
            // Wait a second before showing wait indicator
            vm.waiting = waitIndicator.waiting();
          },
          1000);
        $scope.$on('$destroy', function() {
          $timeout.cancel(timer);}
        );
      }
      else
        vm.waiting = false;
    }
  }


})();
