/**
 * @ngdoc service
 * @name frontendAnimation:animationTimers
 * @description
 * Provide delays when animating visual elements, like forms.
 */
(function () {
  'use strict';

  angular
    .module('frontendAnimation')
    .factory('animationTimers', factory);

  /** @ngInject */
  function factory($timeout, animationIntervals) {
    return {
      /**
       * @ngdoc function
       * @name delayIn
       * @methodOf frontendAnimation:animationTimers
       * @description
       * Delay while showing elements.
       * @returns {Object} a promise.
      */
      delayIn: function() {
        return $timeout(animationIntervals.in);
      },
      /**
       * @ngdoc function
       * @name delayOut
       * @methodOf frontendAnimation:animationTimers
       * @description
       * Delay while hiding elements.
       * @returns {Object} a promise.
       */     
      delayOut: function() {
        return $timeout(animationIntervals.out);
      },
      /**
       * @ngdoc function
       * @name digest
       * @methodOf frontendAnimation:animationTimers
       * @description
       * Allow evaulation of ng-class before hiding or showing elements.
       * @returns {Object} a promise.
       */
      digest: function() {
        return $timeout(0);
      }
    };

  }
})();




