(function () {
  'use strict';

  angular
    .module('frontendRouter')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider,
                        teamsResource, playersResource, matchesResource, scoreboardResource) {
    var header = {
      templateUrl: 'app/header/header.html',
      controller: 'HeaderController',
      controllerAs: 'header'
    };

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          'header': header,
          'content': {
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
        templateUrl: 'app/scores/scoreBoard.html',
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
      return makeQueryPromise($injector, playersResource);
    }

    /** @ngInject */
    function resolveMatches($injector) {
      return makeQueryPromise($injector, matchesResource);
    }

    /** @ngInject */
    function resolveTeams($injector) {
      return makeQueryPromise($injector, teamsResource);
    }

    /** @ngInject */
    function resolveScoreBoard($injector, $stateParams) {
      return makeGetPromise($injector, scoreboardResource, $stateParams.id);
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
      function makeResourcePromise($q, $log, waitIndicator, crudResource, resourceName) {
        var resource = crudResource.getResource(resourceName);
        var deferred = $q.defer();
        var endWait = waitIndicator.beginWait();
        resource.query(
          function (response) {
            endWait();
            deferred.resolve(response);
          },
          function (response) {
            $log.error('data error ' + response.status + " " + response.statusText);
            endWait();
            // Resolved even if error making http request
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
      function makeResourcePromise($q, $log, waitIndicator, crudResource) {
        var resource = crudResource.getResource(resourceName);
        var deferred = $q.defer();
        var endWait = waitIndicator.beginWait();
        resource.get({id: id},
          function (response) {
            endWait();
            deferred.resolve(response);
          },
          function (response) {
            $log.error('data error ' + response.status + " " + response.statusText);
            endWait();
            deferred.resolve(response);
          }
        );
        return deferred.promise;
      }
    }
  }

})();
