/**
 * @ngdoc object
 * @name frontendAnimation:animationIntervals
 * @description
 *
 * Define the time in milliseconds to allow elements to be animate when being
 * shown or hidden.
 */
(function() {
  'use strict';

  angular
    .module('frontendAnimation')
    .constant('animationIntervals', {in: 200, out: 200});

})();
