/**
 * @ngdoc service
 * @name userResource
 * @description
 * Service to access current user by HTTP request
 *
 */
(function() {
  'use strict';

  angular
    .module('frontendAuth')
    .factory('userResource', factory);

  /** @ngInject */
  function factory($log, $resource, apiPath, userPath) {
    var path = apiPath + userPath;

    var service = {
      path: path,
      getUser: getUser
    };

    return service;

    function getUser() {
      return $resource(path, null);
    }
  }
})();
