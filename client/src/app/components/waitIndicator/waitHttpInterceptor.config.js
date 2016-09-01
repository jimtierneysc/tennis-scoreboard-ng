/**
 * @ngdoc object
 * @name app.components.config:waitHttpInterceptor 
 * @description
 * Automatically display the wait indicator during HTTP requests
 */

(function () {
  'use strict';

  angular
    .module('app.components')
    .config(config);
  
  /** @ngInject */
  function config($httpProvider) {
    $httpProvider.interceptors.push(interceptor);
    
    /** @ngInject */
    function interceptor($q, waitIndicator) {
      var endWait;
      return {
        'request': function (config) {
          endWait = waitIndicator.beginWait();
          return config;
        },

        'response': function (response) {
            endWait();
          return response;
        },

        'responseError': function (rejection) {
          if (endWait)
            endWait();
          return $q.reject(rejection);
        }
      };
    }
  }
})();
