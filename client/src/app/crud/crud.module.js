/**
 * @ngdoc overview
 * @name app.crud
 * @description
 *
 * # app.crud
 *
 * The `app.crud` module provides shared code for implementing
 * a view to create, read, update and delete entities.
 */
(function() {
  'use strict';

  angular
    .module('app.crud', ['app.api', 'app.components', 'app.animation', 'app.auth',
      'ngResource']);

})();
