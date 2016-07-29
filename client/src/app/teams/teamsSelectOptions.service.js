/**
 * @ngdoc service
 * @name teamsSelectOptions
 * @description
 * Provide list of teams for select list
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendTeams')
    .factory('teamsSelectOptions', factory);

  /** @ngInject */
  function factory($log, $q, crudResource, teamsResource) {

    return getSelectOptions;

    // Return a promise
    function getSelectOptions() {
      var deferredObject = $q.defer();
      crudResource.getResource(teamsResource).query(
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
