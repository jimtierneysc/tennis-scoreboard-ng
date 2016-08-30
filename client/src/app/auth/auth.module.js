/**
 * @ngdoc overview
 * @name frontendAuth
 * @description
 *
 * # frontendAuth
 *
 * The `frontendAuth` module provides support for authenticating and authorizing a user
 */
(function () {
  'use strict';

  angular.module('frontendAuth', ['frontendApi', 'frontendComponents',
    'ngSanitize', 'ngStorage', 'ngResource']);

})();
