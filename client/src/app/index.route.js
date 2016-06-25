(function () {
  'use strict';

  angular
    .module('frontend')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
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
          'content': {
            templateUrl: 'app/main/main.html'
          }
        }
      })
      .state('players', {
        url: '/players',
        views: {
          'header': header,
          'content': {
            templateUrl: 'app/players/players.html',
            controller: 'PlayerController',
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
            controller: 'TeamController',
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
            controller: 'MatchController',
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
            controller: 'ScoreController',
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
        templateUrl: 'app/scores/scoreBoard.html',
        controller: 'ScoreBoardController',
        controllerAs: 'vm',
        resolve: {
          response: resolveScoreBoard()
        }
      })
      .state('signin', {
        templateUrl: 'app/user/new.html',
        controller: 'UserController',
        controllerAs: 'vm'
      })


    ;

    $urlRouterProvider.otherwise('/');

    function resolvePlayers() {
      /** @ngInject */
      function resolve(playersResource, $q, $log, waitIndicator) {
        return resolveResourceQuery(playersResource.getPlayers(), $q, waitIndicator, $log);
      }
      return resolve;
    }

    function resolveMatches() {
      /** @ngInject */
      function resolve(matchesResource, $log, $q, waitIndicator) {
        return resolveResourceQuery(matchesResource.getMatches(), $q, waitIndicator, $log);
      }
      return resolve;
    }

    function resolveTeams() {
      /** @ngInject */
      function resolve(teamsResource, $q, $log, waitIndicator) {
        return resolveResourceQuery(teamsResource.getTeams(), $q, waitIndicator, $log);
      }
      return resolve;
    }

    function resolveScoreBoard() {
      /** @ngInject */
      function resolve(scoreBoardResource, $stateParams, $q, waitIndicator, $log) {
        return resolveResourceGet(scoreBoardResource.getScoreBoard(), $stateParams.id, $q, waitIndicator, $log);
      }
      return resolve;
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
