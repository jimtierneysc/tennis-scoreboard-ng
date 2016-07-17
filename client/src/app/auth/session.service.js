/**
 * @ngdoc service
 * @name sessionResource
 * @description
 * Service to login a user
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('sessionResource', factory);

  /** @ngInject */
  function factory($log, $resource, baseURL) {
    var path = baseURL + 'sessions';

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
