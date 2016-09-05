/**
 * @ngdoc service
 * @name app.auth.userResource
 * @description
 * Service to access the current user by REST API request
 *
 */
(function() {
  'use strict';

  angular
    .module('app.auth')
    .factory('userResource', factory);

  /** @ngInject */
  function factory($resource, apiPath, userPath) {
    var path = apiPath + userPath;

    var service = {
      path: path,
      /**
       * @ngdoc function
       * @name getUser
       * @methodOf app.auth.userResource
       * @description
       * Get a $resource for making a REST API request
       * @returns {Object} $resource
       */
      getUser: getUser
    };

    return service;

    function getUser() {
      return $resource(path, null);
    }
  }
})();
