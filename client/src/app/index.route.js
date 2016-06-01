(function () {
  'use strict';

  angular
    .module('frontend')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        views: {
          'header': {
            templateUrl: 'app/header/header.html'
          }
          ,
          'content': {
            templateUrl: 'app/main/main.html'
          }
        }
      })
      .state('players', {

        url: '/players',
        views: {
          'header': {
            templateUrl: 'app/header/header.html'
          }
          ,
          'content': {
            templateUrl: 'app/players/players.html',
            controller: 'PlayerController',
            controllerAs: 'main',
            resolve: {
              /** @ngInject */
              response: function (playersResource, $log, $q) {
                return resolvePlayers(playersResource, $q, $log);
              }
            }
          }
        }
      })
      .state('teams', {

        url: '/teams',
        views: {
          'header': {
            templateUrl: 'app/header/header.html'
          }
          ,
          'content': {
            templateUrl: 'app/teams/teams.html',
            controller: 'TeamController',
            controllerAs: 'main',
            resolve: {
              /** @ngInject */
              response: function (teamsResource, $log, $q) {
                return resolveTeams(teamsResource, $q, $log);
              }
            }
          }
        }
      })
      .state('matches', {

        url: '/matches',
        views: {
          'header': {
            templateUrl: 'app/header/header.html'
          }
          ,
          'content': {
            templateUrl: 'app/matches/matches.html',
            controller: 'MatchController',
            controllerAs: 'main',
            resolve: {
              /** @ngInject */
              response: function (matchesResource, $log, $q) {
                return resolveMatches(matchesResource, $q, $log);
              }
            }
          }
        }
      })
      .state('scores', {

        url: '/scores',
        views: {
          'header': {
            templateUrl: 'app/header/header.html'
          }
          ,
          'content': {
            templateUrl: 'app/scores/scores.html',
            controller: 'ScoreController',
            controllerAs: 'main',
            resolve: {
              /** @ngInject */
              response: function (matchesResource, $log, $q) {
                return resolveMatches(matchesResource, $q, $log);
              }
            }
          }
        }
      })
      .state('scores.board', {

        url: '/board/:id',
        templateUrl: 'app/scores/scoreBoard.html',
        controller: 'ScoreBoardController',
        controllerAs: 'sub',
        resolve: {
          /** @ngInject */
          response: function (scoreBoardResource, $stateParams, $log, $q) {
            return resolveScoreBoard(scoreBoardResource, $stateParams, $q, $log);
          }
        }

      })
    ;

    $urlRouterProvider.otherwise('/');

    function resolvePlayers(playersResource, $q, $log) {
      return resolveResourceQuery(playersResource.getPlayers(), $q, $log);
    }

    function resolveMatches(matchesResource, $q, $log) {
      return resolveResourceQuery(matchesResource.getMatches(), $q, $log);
    }

    function resolveTeams(teamsResource, $q, $log) {
      return resolveResourceQuery(teamsResource.getTeams(), $q, $log);
    }

    function resolveScoreBoard(scoreBoardsResource, $stateParams, $q, $log) {
      return resolveResourceGet(scoreBoardsResource.getScoreBoard(), $stateParams.id, $q, $log);
    }

    function resolveResourceQuery(resource, $q, $log) {
      var deferred = $q.defer();
      resource.query(
        function (response) {
          $log.info('received data');
          deferred.resolve(response);
        },
        function (response) {
          $log.error('data error ' + response.status + " " + response.statusText);
          deferred.resolve(response);
        }
      );
      return deferred.promise;
    }

    function resolveResourceGet(resource, id, $q, $log) {
      var deferred = $q.defer();
      resource.get({id: id},
        function (response) {
          $log.info('received data');
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

})();
