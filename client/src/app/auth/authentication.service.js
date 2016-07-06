(function () {
  'use strict';

  angular
    .module('frontend')
    .service('authenticationService', Service);

  /** @ngInject */
  function Service($http, $cookieStore, $rootScope, $log, $localStorage) {
    var service = this;

    var HEADERNAME = 'Authorization';
    var DATANAME = 'credentials';

    service.setCredentials = setCredentials;
    service.clearCredentials = clearCredentials;
    service.loadCredentials = loadCredentials;
    service.subscribeChanged = subscribeChanged;
    service.loggedIn = false;
    service.userName = "";
    service.headerName = HEADERNAME;
    service.localDataName = DATANAME;

    var data = null;


    function setCredentials(username, token) {
      data = {
        currentUser: {
          username: username,
          token: token
        }
      };

      $http.defaults.headers.common[HEADERNAME] = token; 
      // $cookieStore.put('globals', data);
      $localStorage[DATANAME] = data;
      changed();
    }

    function clearCredentials() {
      data = {};
      // $cookieStore.remove('globals');
      $localStorage[DATANAME] = undefined;
      delete $http.defaults.headers.common[HEADERNAME];
      changed();
    }

    function loadCredentials() {
      // data = $cookieStore.get('globals') || {};
      data = $localStorage[DATANAME] || {};
      if (data.currentUser) {
        $http.defaults.headers.common[HEADERNAME] = data.currentUser.token;
      }
      changed();
    }

    var EVENT_NAME = 'auth-service:change';

    function subscribeChanged(scope, callback) {
      var handler = $rootScope.$on(EVENT_NAME, callback);
      scope.$on('$destroy', handler);
    }

    function changed() {
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
