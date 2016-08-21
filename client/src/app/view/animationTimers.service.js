/**
 * @ngdoc factory
 * @name animationTiming
 * @description
 * Provide delays when animating visual elements, like forms.
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendView')
    .factory('animationTimers', factory);

  /** @ngInject */
  function factory($timeout, animationIntervals) {
    return {
      // Delay while showing something
      delayIn: function() {
        return $timeout(animationIntervals.in);
      },
      // Delay while hiding something
      delayOut: function() {
        return $timeout(animationIntervals.out);
      },
      // Allow evaulation of ng-class to prepare for animation
      digest: function() {
        return $timeout(0);
      }
    };

  }
})();




