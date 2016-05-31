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
            controllerAs: 'main'
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
            controllerAs: 'main'
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
            controllerAs: 'main'
            // TODO: Refactor to support resolve.
            // Service must retrieve matches and then
            // here the matches are passed to controller.
            // resolve: {
            //   /** @ngInject */
            //   greeting: function ($q, $timeout) {
            //     var deferred = $q.defer();
            //     $timeout(function () {
            //       deferred.resolve('Hello!');
            //     }, 1000);
            //     return deferred.promise;
            //   }
            // }
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
            controllerAs: 'main'
          }
        }
      })
      .state('scores.board', {

        url: '/board/:id',
        templateUrl: 'app/scores/scoreBoard.html',
        controller: 'ScoreBoardController',
        controllerAs: 'sub'

      })
    ;

    $urlRouterProvider.otherwise('/');

    function resolveMatches(matchesResource) {
      return matchesResource.resolveMatches;
    }

  }

})();
