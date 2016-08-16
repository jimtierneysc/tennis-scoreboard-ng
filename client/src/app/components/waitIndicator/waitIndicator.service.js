/**
 * @ngdoc service
 * @name waitIndicator
 * @description
 * Service to manage state of a wait indicator
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .service('waitIndicator', Service);


  /** @ngInject */
  function Service($log, $rootScope) {

    var vm = this;
    vm.beginWait = beginWait;
    vm.waiting = waiting;
    vm.subscribeChanged = subscribeChanged;

    var waitingCount = 0;

    function beginWait() {
      var last = waiting();
      waitingCount++;
      if (last != waiting())
        changed();
      return endWait;
    }

    function endWait() {
      var last = waiting();
      waitingCount--;
      if (waitingCount < 0) {
        waitingCount = 0;
        $log.error('waitingCount < 0');
      }
      if (last != waiting())
        changed();
    }

    function waiting() {
      return waitingCount > 0;
    }

    var EVENT_NAME = 'wait-indicator:change';

    function subscribeChanged(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function changed() {
      $rootScope.$emit(EVENT_NAME);
    }
  }
})();
