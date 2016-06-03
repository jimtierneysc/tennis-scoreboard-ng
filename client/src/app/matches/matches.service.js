/**
 * @ngdoc service
 * @name matchesResource
 * @description
 * Service to transfer match JSON between frontend and backend
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('matchesResource', matchesFunc);

  /** @ngInject */
  function matchesFunc($log, $resource, baseURL) {
    var path = baseURL + 'matches';

    var service = {
      path: path,
      getMatches: getMatches
    };

    return service;

    function getMatches() {
      $log.info("getMatches()");
      var Match = $resource(path + '/:id', null, {'update': {method: 'PUT'}});
      return Match;
    }

  }
})();
