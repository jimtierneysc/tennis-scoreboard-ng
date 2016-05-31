/**
 * @ngdoc service
 * @name teamsSelectOptions
 * @description
 * Provide list of teams for select list
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('teamsSelectOptions', teamsFunc);

  /** @ngInject */
  function teamsFunc($log, $q, teamsResource) {

    var service = {
      getSelectOptions: getSelectOptions
    };

    return service;

    // Return a promise
    function getSelectOptions() {
      var deferredObject = $q.defer();
      teamsResource.getTeams().query(
        function (response) {
          $log.info('received data');
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.displayName, id: value.id});
          }, options);
          deferredObject.resolve(options);
        },
        function (response) {
          $log.error('data error ' + response.status + " " + response.statusText);
          deferredObject.reject();
        }
      );
      return deferredObject.promise;
    }

  }
})();
