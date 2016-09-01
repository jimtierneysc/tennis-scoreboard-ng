/**
 * @ngdoc service
 * @name app.auth.sessionResource
 * @description
 * Service to login a user by HTTP request
 *
 */
(function() {
  'use strict';

  angular
    .module('app.auth')
    .factory('sessionResource', factory);

  /** @ngInject */
  function factory($resource, apiPath, sessionsPath) {
    var path = apiPath + sessionsPath;

    var service = {
      path: path,
      /**
       * @ngdoc function
       * @name getSession
       * @methodOf app.auth.sessionResource
       * @description
       * Get a $resource for making a REST API request
       * @returns {Object} $resource
       */
      getSession: getSession
    };

    return service;

    function getSession() {
      return $resource(path, null, {'login': {method: 'POST', params: null}});
    }
  }
})();
