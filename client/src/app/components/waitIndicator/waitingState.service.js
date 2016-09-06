/**
 * @ngdoc service
 * @name app.components.waitingState
 * @description
 * Service to manage the waiting state of the application.
 */

(function () {
  'use strict';

  angular
    .module('app.components')
    .service('waitingState', Service);


  /** @ngInject */
  function Service($log, $rootScope) {

    var vm = this;
    vm.beginWait = beginWait;
    vm.waiting = waiting;
    vm.subscribeChanged = subscribeChanged;

    var waitingCount = 0;

    /**
     * @ngdoc function
     * @name beginWait
     * @methodOf app.components.waitingState
     * @description
     * Begin waiting
     * @returns {Function}
     * Function to end waiting
     */
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

    /**
     * @ngdoc function
     * @name waiting
     * @methodOf app.components.waitingState
     * @description
     * Indicate if the application is waiting or not.
     * @returns {Boolean}
     * Truthy if waiting
     */
    function waiting() {
      return waitingCount > 0;
    }

    var EVENT_NAME = 'wait-indicator:change';

    /**
     * @ngdoc function
     * @name subscribeChanged
     * @methodOf app.components.waitingState
     * @description
     * Provide a callback for a controller to be informed of a change to the
     * waiting state
     * @param {Object} scope
     * Controller scope
     * @param {Function} callback
     * Callback to inform of a change
     */
    function subscribeChanged(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function changed() {
      $rootScope.$emit(EVENT_NAME);
    }
  }
})();
