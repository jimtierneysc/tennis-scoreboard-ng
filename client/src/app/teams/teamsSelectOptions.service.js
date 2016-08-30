/**
 * @ngdoc service
 * @name frontendTeams:teamsSelectOptions
 * @description
 * Provide a list of teams for populating a select list
 *
 */
/**
 * @ngdoc service
 * @name frontendTeams:teamsSelectOptions
 * @description
 * Provide a list of teams for populating a select list
 *
 */(function () {
  'use strict';

  angular
    .module('frontendTeams')
    .factory('teamsSelectOptions', factory);

  /** @ngInject */
  function factory($log, $q, crudResource, teamsPath) {

    return getSelectOptions;

    /**
     * @ngdoc function
     * @name getSelectOptions
     * @methodOf frontendTeams:teamsSelectOptions
     * @description
     * Makes a REST API request to retrieve a list of teams.
     * Creates an array of team names from the response.
     *
     * @returns {Object} promise
     * * Resolved with an array when the REST API request succeeds
     * * Rejected when the REST API request fails
     */
    function getSelectOptions() {
      var deferredObject = $q.defer();
      crudResource.getResource(teamsPath).query(
        function (response) {
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.name || '(unnamed)', id: value.id});
          });
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
