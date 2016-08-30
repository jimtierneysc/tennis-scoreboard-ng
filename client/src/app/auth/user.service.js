/**
 * @ngdoc service
 * @name userResource
 * @description
 * Service to access the current user by REST API request
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
      /**
       * @ngdoc function
       * @name getUser
       * @methodOf userResource
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
