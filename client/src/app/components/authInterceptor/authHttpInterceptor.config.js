/**
 * @ngdoc object
 * @name app.components.config:authHttpInterceptorConfig
 * @description
 * Registers an interceptor to allow the authHttpInterceptor service to receive http errors.
 */

(function () {
  'use strict';

  angular
    .module('app.components')
    .config(config);

  /** @ngInject */
  function config($httpProvider) {
    $httpProvider.interceptors.push('authHttpInterceptor');
  }

})();
