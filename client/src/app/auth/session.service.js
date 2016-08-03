/**
 * @ngdoc service
 * @name sessionResource
 * @description
 * Service to login a user by HTTP request
 *
 */
(function() {
  'use strict';

  angular
    .module('frontendAuth')
    .factory('sessionResource', factory);

  /** @ngInject */
  function factory($resource, apiPath, sessionsPath) {
    var path = apiPath + sessionsPath;

    var service = {
      path: path,
      getSession: getSession
    };

    return service;

    function getSession() {
      return $resource(path, null, {'login': {method: 'POST', params: null}});
    }
  }
})();
