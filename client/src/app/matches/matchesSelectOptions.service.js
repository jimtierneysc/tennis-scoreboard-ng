/**
 * @ngdoc service
 * @name matchesSelectOptions
 * @description
 * Provide a list of matches to populate a select list
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('matchesSelectOptions', matchesFunc);

  /** @ngInject */
  function matchesFunc($log, $q, matchesResource, crudResource) {

    return getSelectOptions;

    function getSelectOptions() {
      var deferred = $q.defer();
      crudResource.getResource(matchesResource).query(
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
