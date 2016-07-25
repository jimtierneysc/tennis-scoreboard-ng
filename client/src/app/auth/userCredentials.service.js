(function () {
  'use strict';

  angular
    .module('frontend-auth')
    .service('userCredentials', Service);

  /** @ngInject */
  function Service($http, $rootScope, $log, $localStorage, validateCredentials, authHeaderName) {
    var service = this;

    var DATANAME = 'credentials';

    service.setCredentials = setCredentials;
    service.clearCredentials = clearCredentials;
    service.loadCredentials = loadCredentials;
    service.subscribeChanged = subscribeChanged;
    service.loggedIn = false;
    service.userName = "";
    service.headerName = authHeaderName;
    service.localDataName = DATANAME;

    var data = null;


    function setCredentials(username, token) {
      data = {
        currentUser: {
          username: username,
          token: token
        }
      };

      $http.defaults.headers.common[authHeaderName] = token;
      // $cookieStore.put('globals', data);
      $localStorage[DATANAME] = data;
      changed();
    }

    function clearCredentials() {
      data = {};
      // $cookieStore.remove('globals');
      $localStorage[DATANAME] = undefined;
      delete $http.defaults.headers.common[authHeaderName];
      changed();
    }

    function loadCredentials() {
      data = $localStorage[DATANAME] || {};
      if (data && data.currentUser) {
        validateCredentials(data.currentUser).then(
          function (credentials) {
            data.currentUser = angular.copy(credentials);
            changed();
          },
          function () {
            clearCredentials();
          }
        );
      }
      else
        changed();
     }

      var EVENT_NAME = 'user-credentials:change';

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


  }

  )();
