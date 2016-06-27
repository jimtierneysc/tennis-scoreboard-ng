(function () {
  'use strict';

  angular
    .module('frontend')
    .service('authenticationService', Service);

  /** @ngInject */
  function Service($http, $cookieStore, $rootScope, $log, $localStorage) {
    var service = this;

    var AUTHORIZATION = 'Authorization';
    var DATA = 'data';

    service.setCredentials = setCredentials;
    service.clearCredentials = clearCredentials;
    service.loadCredentials = loadCredentials;
    service.subscribeChanged = subscribeChanged;
    service.loggedIn = false;
    service.userName = "";
    service.headerName = AUTHORIZATION;
    service.localDataName = DATA;

    var data = null;


    function setCredentials(username, token) {
      data = {
        currentUser: {
          username: username,
          token: token
        }
      };

      $http.defaults.headers.common[AUTHORIZATION] = token; // jshint ignore:line
      // $cookieStore.put('globals', data);
      $localStorage[DATA] = data;
      changed();
    }

    function clearCredentials() {
      data = {};
      // $cookieStore.remove('globals');
      $localStorage[DATA] = undefined;
      delete $http.defaults.headers.common[AUTHORIZATION];
      changed();
    }

    function loadCredentials() {
      // data = $cookieStore.get('globals') || {};
      data = $localStorage[DATA] || {};
      if (data.currentUser) {
        $http.defaults.headers.common[AUTHORIZATION] = data.currentUser.token;
      }
      changed();
    }

    var EVENT_NAME = 'auth-service:change';

    function subscribeChanged(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function changed() {
      $log.info('changed');
      service.loggedIn = angular.isDefined(data.currentUser);
      if (service.loggedIn) {
        service.userName = data.currentUser.username;
      }
      else
        service.userName = "";

      $rootScope.$emit(EVENT_NAME);
    }
  }


})();
