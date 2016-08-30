/**
 * @ngdoc service
 * @name frontendPlayers:playersSelectOptions
 * @description
 * Provide a list of players for populating a select list
 *
 */
(function() {
  'use strict';

  angular
    .module('frontendPlayers')
    .factory('playersSelectOptions', playersFunc);

  /** @ngInject */
  function playersFunc($log, $q, crudResource, playersPath) {

    return getSelectOptions;

    /**
     * @ngdoc function
     * @name getSelectOptions
     * @methodOf frontendPlayers:playersSelectOptions
     * @description
     * Makes a REST API request to retrieve a list of matches.
     * Creates an array of player names from the response.
     *
     * @returns {Object} promise
     * * Resolved with an array when the REST API request succeeds
     * * Rejected when the REST API request fails
     */
    function getSelectOptions() {
      var deferredObject = $q.defer();
      crudResource.getResource(playersPath).query(
        function (response) {
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.name, id: value.id});
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
