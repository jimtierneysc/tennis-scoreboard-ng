/**
 * @ngdoc service
 * @name waitIndicator
 * @description
 * Service to track state of a wait indicator
 * 
 * var endWait = waitIndicator.beginWait();
 * endWait();
 * 
 * waitIndicator.subscribeChanged(scope, function() { // do something } );
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .service('waitIndicator', serviceFunc);

  /** @ngInject */
  function serviceFunc($log, $rootScope) {

    var vm = this;
    vm.beginWait = beginWait;
    vm.waiting = waiting;
    vm.subscribeChanged = subscribeChanged;

    var waitingCount = 0;

    function beginWait() {
      $log.info("beginWait");
      var last = waiting();
      waitingCount++;
      if (last != waiting())
        changed();
      return endWait;
    }

    function endWait() {
      $log.info("endWait");
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
      $log.info('changed');
      $log.info('waitingCount: ' + waitingCount);
      $rootScope.$emit(EVENT_NAME);
    }

  }
})();
