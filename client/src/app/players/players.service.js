/**
 * @ngdoc service
 * @name playersResource
 * @description
 * Service to transfer player JSON between frontend and backend
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('playersResource', playersFunc);

  /** @ngInject */
  function playersFunc($log, $resource, baseURL) {
    var path = baseURL + 'players';

    var service = {
      path: path,
      getPlayers: getPlayers
    };

    return service;

    function getPlayers() {
      $log.info("getPlayers()");
      return $resource(path + '/:id', null, {'update': {method: 'PUT'}});
    }
  }
})();
