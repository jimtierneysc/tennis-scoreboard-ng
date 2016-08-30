/**
 * @ngdoc object
 * @name authHttpInterceptor
 * @description
 * Allow authHttpInterceptor service to receive http errors.
 */

(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .config(config);
  
  /** @ngInject */
  function config($httpProvider) {
    $httpProvider.interceptors.push('authHttpInterceptor');
  }

})();
