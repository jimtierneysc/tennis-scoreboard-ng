/**
 * @ngdoc overview
 * @name app.auth
 * @description
 *
 * # app.auth
 *
 * The `app.auth` module provides support for authenticating and authorizing a user
 */
(function () {
  'use strict';

  angular.module('app.auth', ['app.api', 'app.components',
    'ngSanitize', 'ngStorage', 'ngResource']);

})();
