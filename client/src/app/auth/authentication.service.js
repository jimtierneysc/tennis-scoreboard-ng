(function () {
  'use strict';

  angular
    .module('frontend')
    .service('authenticationService', Service);

  /** @ngInject */
  function Service($http, $cookieStore, $rootScope, $log) {
    var service = this;

    service.setCredentials = setCredentials;
    service.clearCredentials = clearCredentials;
    service.loadCredentials = loadCredentials;
    service.subscribeChanged = subscribeChanged;
    service.loggedIn = false;
    service.userName = "";

    var AUTHORIZATION = 'Authorization';

    function setCredentials(username, token) {
      // var /authdata = Base64.encode(username + ':' + password);

      $rootScope.globals = {
        currentUser: {
          username: username,
          token: token
        }
      };

      $http.defaults.headers.common[AUTHORIZATION] = token; // jshint ignore:line
      $cookieStore.put('globals', $rootScope.globals);
      changed();
    }

    function clearCredentials() {
      $rootScope.globals = {};
      $cookieStore.remove('globals');
      delete $http.defaults.headers.common[AUTHORIZATION];
      changed();
    }

    function loadCredentials() {
      $rootScope.globals = $cookieStore.get('globals') || {};
      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common[AUTHORIZATION] = $rootScope.globals.currentUser.token; // jshint ignore:line
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
      service.loggedIn = angular.isDefined($rootScope.globals.currentUser);
      if (service.loggedIn) {
        service.userName = $rootScope.globals.currentUser.username;
      }
      else
        service.userName = "";

      $rootScope.$emit(EVENT_NAME);
    }
  }


})();
