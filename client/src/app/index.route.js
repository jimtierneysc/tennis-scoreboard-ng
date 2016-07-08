(function () {
  'use strict';

  angular
    .module('frontend')
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
            templateUrl: 'app/home/home.html'
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
              response: resolvePlayers()
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
              response: resolveTeams()
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
              response: resolveMatches()
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
              response: resolveMatches()
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
          response: resolveScoreBoard()
        }
      })
      // .state('signin', {
      //   templateUrl: 'app/user/new.html',
      //   controller: 'UserController',
      //   controllerAs: 'vm'
      // })


    ;

    $urlRouterProvider.otherwise('/');

    function resolvePlayers() {
      return resolveResourceQuery(playersResource);
    }

    function resolveMatches() {
      return resolveResourceQuery(matchesResource);
    }

    function resolveTeams() {
      return resolveResourceQuery(teamsResource);
    }

    function resolveScoreBoard() {
      return resolveResourceGet(scoreboardResource);
    }

    function resolveResourceQuery(resourceName) {
      /** @ngInject */
      function resolve($q, $log, waitIndicator, crudResource) {
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
            deferred.resolve(response);
          }
        );
        return deferred.promise;
      }
      return resolve;
    }

    // function resolveResourceQuery(resourceName) {
    //   /** @ngInject */
    //   function resolve($q, $log, waitIndicator, crudResource) {
    //     var resource = crudResource.getResource(resourceName);
    //     var endWait = waitIndicator.beginWait();
    //     return resource.query(
    //       function (response) {
    //         endWait();
    //       },
    //       function (response) {
    //         $log.error('data error ' + response.status + " " + response.statusText);
    //         endWait();
    //       }
    //     );
    //     // return deferred.promise;
    //   }
    //   return resolve;
    // }


    function resolveResourceGet(resourceName) {
      /** @ngInject */
      function resolve($q, $log, waitIndicator, crudResource, $stateParams) {
        var resource = crudResource.getResource(resourceName);
        var deferred = $q.defer();
        var endWait = waitIndicator.beginWait();
        resource.get({id: $stateParams.id},
          function (response) {
            endWait();
            deferred.resolve(response);
          },
          function (response) {
            $log.error('data error ' + response.status + " " + response.statusText);
            endWait();
            deferred.resolve(response);
          }
        )
        return deferred.promise;
      }
      return resolve;
    }

  }

})();
