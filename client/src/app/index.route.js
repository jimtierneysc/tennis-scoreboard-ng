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
              response: resolvePlayers()
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
              response: resolveTeams()
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
              response: resolveMatches()
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
              // parent view shows list of matches
              response: resolveMatches()
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
          response: resolveScoreBoard()
        }


      })
    ;

    $urlRouterProvider.otherwise('/');

    function resolvePlayers() {
      /** @ngInject */
      return function (playersResource, $q, $log, waitIndicator) {
        return resolveResourceQuery(playersResource.getPlayers(), $q, waitIndicator, $log);
      }
    }

    function resolveMatches() {
      /** @ngInject */
      return function (matchesResource, $log, $q, waitIndicator) {
        return resolveResourceQuery(matchesResource.getMatches(), $q, waitIndicator, $log);
      };
    }

    function resolveTeams() {
      /** @ngInject */
      return function (teamsResource, $q, $log, waitIndicator) {
        return resolveResourceQuery(teamsResource.getTeams(), $q, waitIndicator, $log);
      }
    }

    function resolveScoreBoard() {
      /** @ngInject */
      return function (scoreBoardResource, $stateParams, $q, waitIndicator, $log) {
        return resolveResourceGet(scoreBoardResource.getScoreBoard(), $stateParams.id, $q, waitIndicator, $log);
      }
    }

    function resolveResourceQuery(resource, $q, waitIndicator, $log) {
      var deferred = $q.defer();
      var endWait = waitIndicator.beginWait();
      resource.query(
        function (response) {
          $log.info('received data');
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

    function resolveResourceGet(resource, id, $q, waitIndicator, $log) {
      var deferred = $q.defer();
      var endWait = waitIndicator.beginWait();
      resource.get({id: id},
        function (response) {
          $log.info('received data');
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

})();
