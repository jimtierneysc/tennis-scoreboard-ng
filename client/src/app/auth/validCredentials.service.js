(function () {
  'use strict';

  angular
    .module('frontendAuth')
    .factory('validateCredentials', factory);

  /** @ngInject */
  function factory($http, $log, userResource, authHeaderName, $q) {
    return validateCredentials;

    function validateCredentials(currentUser) {
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
