/**
 * @ngdoc service
 * @name teamsResource
 * @description
 * Service to transfer team JSON between frontend and backend
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('teamsResource', teamsFunc);

  /** @ngInject */
  function teamsFunc($log, $resource, baseURL) {
    var path = baseURL + 'teams';

    var service = {
      path: path,
      getTeams: getTeams
    };

    return service;

    function getTeams() {
      $log.info("getTeams()");
      var Team = $resource(path + '/:id', null, {'update': {method: 'PUT'}});
      Object.defineProperty(
        Team.prototype,
        "displayName",
        {
          get: function () {
            if (this.name)
              return this.name;
            else
              return "(unnamed)";
          }
        }
      );
      return Team;

    }


  }
})();
