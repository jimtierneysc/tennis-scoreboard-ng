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

        url: '/',
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

        url: '/',
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

        url: '/',
        views: {
          'header': {
            templateUrl: 'app/header/header.html'
          }
          ,
          'content': {
            templateUrl: 'app/matches/matches.html',
            controller: 'MatchController',
            controllerAs: 'main'
          }
        }
      })


    ;

    $urlRouterProvider.otherwise('/');
  }

})();
