/**
 * @ngdoc service
 * @name app.components.authHttpInterceptor
 * @description
 * Intercept HTTP error 401 unauthorized and notify subscribers.  This
 * error means that the auth token is no longer valid.
 *
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .service('authHttpInterceptor', service);

  /** @ngInject */
  function service($q, $rootScope) {
    var service = this;

    service.responseError = responseError;
    service.subscribeUnauthorized = subscribeUnauthorized;

    /**
     * @ngdoc function
     * @name responseError
     * @methodOf app.components.authHttpInterceptor
     * @description
     * Intercepts HTTP responses.
     *
     * @param {Object} response
     * HTTP response
     */
    function responseError(response) {
      if (response.status == 401) {
        emitUnauthorized();
      }
      return $q.reject(response);
    }

    var EVENT_NAME = 'auth-interceptor:unauthorized';

    /**
     * @ngdoc function
     * @name subscribeUnauthorized
     * @methodOf app.components.authHttpInterceptor
     * @description
     * Register to receive a notification when an HTTP 401 error occurs.
     *
     * @param {Object} scope
     * Controller scope
     * @param {Function} callback
     * Function to call when HTTP 401 occurs
     */
    function subscribeUnauthorized(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function emitUnauthorized() {
      $rootScope.$emit(EVENT_NAME);
    }
  }

})();
