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
      defineProperties(Match.prototype);
      return Match;
    }

    function defineProperties(klass) {
      
      Object.defineProperty(
        klass,
        "winner_player",
        {
          get: function () {
            var result = null;
            if (this.winner) {
              if (!this.doubles) {
                if (this.first_player.id === this.winner)
                  result = this.first_player;
                else if (this.second_player.id == this.winner)
                  result = this.second_player;
                else
                  $log.error('player winner')

              }
            }
            return result;
          }
        }
      );


      Object.defineProperty(
        klass,
        "winner_team",
        {
          get: function () {
            var result = null;
            if (this.winner) {
              if (this.doubles) {
                if (this.first_team.id === this.winner)
                  result = this.first_team;
                else if (this.second_team.id == this.winner)
                  result = this.second_team;
                else
                  $log.error('team winner')

              }
            }
            return result;
          }
        }
      );


    }


  }
})();
