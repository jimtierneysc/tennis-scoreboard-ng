/**
 * @ngdoc object
 * @name app.components.constant:waitInterval
 * @description
 * Delay before displaying wait indicator (e.g.; spinner)
 */
(function() {
  'use strict';

  angular
    .module('app.components')
    .constant('waitInterval', 1000);

})();
