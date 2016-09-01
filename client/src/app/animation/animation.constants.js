/**
 * @ngdoc object
 * @name app.animation.constant:animationIntervals
 * @description
 *
 * Constants specify the time intervals that allow elements to fade in or face out.
 * These values are equivalent to the transition speeds declared in animation.css
 */
(function() {
  'use strict';

  angular
    .module('app.animation')
    .constant('animationIntervals', {in: 200, out: 200});

})();
