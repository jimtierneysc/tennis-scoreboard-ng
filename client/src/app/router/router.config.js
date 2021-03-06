/**
 * @ngdoc object
 * @name app.router.config:routerConfig
 * @description
 * Configure the views
 * 
 * Names
 * * home
 * * players
 * * teams
 * * matches
 * * scores
 * * scores.board
 * 
 * Resolve 
 * * Close the edit in progress.  See {@link app.components.editInProgress}
 * * Resolve a REST API request (except for the home view, which does not display data)
 *
 */

(function () {
  'use strict';

  angular
    .module('app.router')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider,
                        teamsPath, playersPath, matchesPath, scoreboardPath) {
    var header = {
      templateUrl: 'app/header/header.html',
      controller: 'HeaderController',
      controllerAs: 'vm'
    };

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          'header': header,
          'home': {
            templateUrl: 'app/home/home.html',
            controller: 'HomeController',
            controllerAs: 'vm',
            resolve: {
              response: resolveHome
            }
          }
        }
      })
      .state('players', {
        url: '/players',
        views: {
          'header': header,
          'content': {
            templateUrl: 'app/players/players.html',
            controller: 'PlayersController',
            controllerAs: 'vm',
            resolve: {
              response: resolvePlayers
            }
          }
        }
      })
      .state('teams', {
        url: '/teams',
        views: {
          'header': header,
          'content': {
            templateUrl: 'app/teams/teams.html',
            controller: 'TeamsController',
            controllerAs: 'vm',
            resolve: {
              response: resolveTeams
            }
          }
        }
      })
      .state('matches', {
        url: '/matches',
        views: {
          'header': header,
          'content': {
            templateUrl: 'app/matches/matches.html',
            controller: 'MatchesController',
            controllerAs: 'vm',
            resolve: {
              response: resolveMatches
            }
          }
        }
      })
      .state('scores', {
        url: '/scores',
        views: {
          'header': header,
          'content': {
            templateUrl: 'app/scores/scores.html',
            controller: 'ScoresController',
            controllerAs: 'vm',
            resolve: {
              // parent view shows list of matches
              response: resolveMatches
            }
          }
        }
      })
      .state('scores.board', {
        url: '/board/:id',
        templateUrl: 'app/scores/scoreboard.html',
        controller: 'ScoreboardController',
        controllerAs: 'vm',
        resolve: {
          response: resolveScoreBoard
        }
      });

    $urlRouterProvider.otherwise('/');


    /** @ngInject */
    function resolveHome($injector) {
      return makeDiscardEditsPromise($injector);
    }

    /** @ngInject */
    function resolvePlayers($injector) {
      return makeQueryPromise($injector, playersPath);
    }

    /** @ngInject */
    function resolveMatches($injector) {
      return makeQueryPromise($injector, matchesPath);
    }

    /** @ngInject */
    function resolveTeams($injector) {
      return makeQueryPromise($injector, teamsPath);
    }

    /** @ngInject */
    function resolveScoreBoard($injector, $stateParams) {
      return makeGetPromise($injector, scoreboardPath, $stateParams.id);
    }

    // Return promise
    function makeDiscardEditsPromise($injector, makeNestedPromise) {
      return $injector.invoke(makePromise);

      /** @ngInject */
      function makePromise(editInProgress) {
        var confirm = editInProgress.closeEditors();
        if (makeNestedPromise) {
          return confirm.then(
            function () {
              return makeNestedPromise();
            }
          );
        }
        else
          return confirm;
      }
    }

    // Return promise
    function makeQueryPromise($injector, resourceName) {
      return makeDiscardEditsPromise($injector, function () {
        return $injector.invoke(makeResourcePromise, null, {resourceName: resourceName})
      });

      /** @ngInject */
      function makeResourcePromise($q, $log, crudResource, resourceName) {
        var resource = crudResource.getResource(resourceName);
        var deferred = $q.defer();
        resource.query(
          function (response) {
            deferred.resolve(response);
          },
          function (response) {
            $log.error('data error ' + response.status + " " + response.statusText);
            // Resolve even if an error occurs when making http request
            deferred.resolve(response);
          }
        );
        return deferred.promise;
      }
    }

    function makeGetPromise($injector, resourceName, id) {
      // Child view does not need to cancel edit
      return $injector.invoke(makeResourcePromise, null);

      /** @ngInject */
      function makeResourcePromise($q, $log, crudResource) {
        var resource = crudResource.getResource(resourceName);
        var deferred = $q.defer();
        resource.get({id: id},
          function (response) {
            deferred.resolve(response);
          },
          function (response) {
            $log.error('data error ' + response.status + " " + response.statusText);
            deferred.resolve(response);
          }
        );
        return deferred.promise;
      }
    }
  }

})();
