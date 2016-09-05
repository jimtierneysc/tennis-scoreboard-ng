/**
 * @ngdoc service
 * @name app.auth.userCredentials
 * @description
 * Service to manage the current user's name and session token.
 *
 */
(function () {
    'use strict';

    angular
      .module('app.auth')
      .service('userCredentials', Service);

    /** @ngInject */
    function Service($http, $rootScope, $localStorage, validateCredentials, authHeaderName) {
      var service = this;

      var DATANAME = 'credentials';

      service.setCredentials = setCredentials;
      service.clearCredentials = clearCredentials;
      service.loadCredentials = loadCredentials;
      service.subscribeChanged = subscribeChanged;
      service.loggedIn = false;
      service.username = "";
      service.headerName = authHeaderName;
      service.localDataName = DATANAME;

      var data = null;


      /**
       * @ngdoc function
       * @name setCredentials
       * @methodOf app.auth.userCredentials
       * @description
       * * Store credentials locally
       * * Set HTTP request header.
       * * Emit an event to indicate that credentials have changed.
       * @param {String} username
       * name of current user
       * @param {String} token
       * session token of current user
       */
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

      /**
       * @ngdoc function
       * @name clearCredentials
       * @methodOf app.auth.userCredentials
       * @description
       * * Clear local credentials
       * * Clear HTTP request header.
       * * Emit an event to indicate that credentials have changed.
       * @param {Boolean} loading
       * The application is being loaded
       */
      function clearCredentials(loading) {
        clearData();
        changed(loading);
      }

      /**
       * @ngdoc function
       * @name loadCredentials
       * @methodOf app.auth.userCredentials
       * @description
       * * Load local credentials
       * * Update HTTP request header.
       * * Emit an event to indicate that credentials have changed.
       * @param {Boolean} loading
       * The application is being loaded
       */
      function loadCredentials(loading) {
        data = $localStorage[DATANAME] || {};
        if (data && data.currentUser) {
          validateCredentials(data.currentUser).then(
            function (credentials) {
              data.currentUser = angular.copy(credentials);
              changed(loading);
            },
            function () {
              clearData();
              changed(loading)
            }
          );
        }
        else
          changed(loading);
      }

      var EVENT_NAME = 'user-credentials:change';

      /**
       * @ngdoc function
       * @name subscribeChanged
       * @methodOf app.auth.userCredentials
       * @description
       * Subcribe to a change in user credentials
       * @param {String} scope
       * Controller scope
       * @param {Function} callback
       * Method to call when credentials change
       */
      function subscribeChanged(scope, callback) {
        var handler = $rootScope.$on(EVENT_NAME, 
          function(event, loading) {
            callback(loading)
          });
        scope.$on('$destroy', handler);
      }

      function clearData() {
        data = {};
        // $cookieStore.remove('globals');
        $localStorage[DATANAME] = undefined;
        delete $http.defaults.headers.common[authHeaderName];
      }

      function changed(loading) {
        service.loggedIn = data.currentUser;
        if (service.loggedIn) {
          service.username = data.currentUser.username;
        }
        else
          service.username = "";

        $rootScope.$emit(EVENT_NAME, loading);
      }
    }
  })();
