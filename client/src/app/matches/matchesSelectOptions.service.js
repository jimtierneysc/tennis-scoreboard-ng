/**
 * @ngdoc service
 * @name frontendMatches:matchesSelectOptions
 * @description
 * Provides a list of matches to populate a select list
 */
(function() {
  'use strict';

  angular
    .module('frontendMatches')
    .factory('matchesSelectOptions', matchesFunc);

  /** @ngInject */
  function matchesFunc($log, $q, matchesPath, crudResource) {

    return getSelectOptions;

    /**
     * @ngdoc function
     * @name getSelectOptions
     * @methodOf frontendMatches:matchesSelectOptions
     * @description
     * Makes a REST API request to retrieve a list of matches.
     * Creates an array of match titles from the response.
     *
     * @returns {Object} promise
     * * Resolved with an array when the REST API request succeeds
     * * Rejected when the REST API request fails
     */
    function getSelectOptions() {
      var deferred = $q.defer();
      crudResource.getResource(matchesPath).query(
        function (response) {
          var options = [];
          angular.forEach(response, function (value) {
            options.push({title: value.title || '(untitled)', id: value.id});
          });
          deferred.resolve(options);
        },
        function (response) {
          $log.error('data error ' + response.status + " " + response.statusText);
          deferred.reject();
        }
      );
      return deferred.promise;
    }

  }
})();
