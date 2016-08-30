/**
 * @ngdoc service
 * @name validateCredentials
 * @description
 * Service to validate local user credentials by making a REST API request
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendAuth')
    .factory('validateCredentials', factory);

  /** @ngInject */
  function factory($http, $log, userResource, authHeaderName, $q) {
    return validate;

    /**
     * @ngdoc function
     * @name validate
     * @methodOf validateCredentials
     * @description
     * Make a REST API request using the token.
     * @param {Object} currentUser
     * username and token
     * @returns {Object} a promise
     * * The promise is resolved with a valid username and token.
     * * The promise is rejected if the token is not valid.
     */
    function validate(currentUser) {
      var deferred = $q.defer();
      if (currentUser) {
        $http.defaults.headers.common[authHeaderName] = currentUser.token;
        // Credentials are valid when token identifies a user
        userResource.getUser().get(
          function (response) {
            deferred.resolve({
              username: response.username,
              token: currentUser.token
            });
          },
          function (response) {
            $log.error('validateCredentials getUser() ' + response.status);
            deferred.reject();
          });
      } else
        deferred.reject();
      return deferred.promise;
    }
  }
})();
