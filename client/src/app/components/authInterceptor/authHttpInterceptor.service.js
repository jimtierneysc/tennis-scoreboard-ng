/**
 * @ngdoc service
 * @name authHttpInterceptor
 * @description
 * Intercept HTTP error 401 unauthorized and notify subscribers.  This
 * error means that the auth token is no longer valid.
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .service('authHttpInterceptor', service);

  /** @ngInject */
  function service($q, $rootScope) {
    var service = this;

    service.responseError = responseError;
    service.subscribeUnauthorized = subscribeUnauthorized;

    // Interceptor method
    function responseError(response) {
      if (response.status == 401) {
        emitUnauthorized();
      }
      return $q.reject(response);
    }

    var EVENT_NAME = 'auth-interceptor:unauthorized';

    function subscribeUnauthorized(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function emitUnauthorized() {
      $rootScope.$emit(EVENT_NAME);
    }
  }

})();
