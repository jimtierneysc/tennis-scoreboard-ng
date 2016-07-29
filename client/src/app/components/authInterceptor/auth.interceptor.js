/**
 * @ngdoc service
 * @name authInterceptor
 * @description
 * Intercept HTTP error 401
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .service('authInterceptor', service)
    .config(config);

  /** @ngInject */
  function service($q, $rootScope) {
    var service = this;

    service.responseError = responseError;
    service.subscribeUnauthorized = subscribeUnauthorized;

    function responseError(response) {
      if (response.status == 403) {
        unauthorized();
      }
      return $q.reject(response);
    };

    var EVENT_NAME = 'auth-interceptor:unauthorized';

    function subscribeUnauthorized(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function unauthorized() {
      $rootScope.$emit(EVENT_NAME);
    }

  }

  /** @ngInject */
  function config($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }

})();
