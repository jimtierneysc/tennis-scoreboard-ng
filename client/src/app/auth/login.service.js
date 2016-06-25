/**
 * @ngdoc service
 * @name loginResource
 * @description
 * Service to login a user
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('loginResource', resourceFunc);

  /** @ngInject */
  function resourceFunc($log, $resource, baseURL) {
    var path = baseURL + 'sessions';

    var service = {
      path: path,
      getLogin: getLogin
    };

    return service;

    function getLogin() {
      $log.info("getLogin()");
      return $resource(path, null, {'login': {method: 'POST', params: null}});
    }
  }
})();
