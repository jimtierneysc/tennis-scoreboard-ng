/**
 * @ngdoc service
 * @name userResource
 * @description
 * Service to access current user
 *
 */
(function() {
  'use strict';

  angular
    .module('frontendAuth')
    .factory('userResource', factory);

  /** @ngInject */
  function factory($log, $resource, baseURL) {
    var path = baseURL + 'user';

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
