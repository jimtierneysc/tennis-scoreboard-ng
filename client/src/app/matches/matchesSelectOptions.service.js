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
  function matchesFunc($log, $q, matchesResource) {

    var service = {
      getSelectOptions: getSelectOptions
    };

    return service;

    // Return a promise
    function getSelectOptions() {
      var deferred = $q.defer();
      matchesResource.getMatches().query(
        function (response) {
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.title, id: value.id});
          }, options);
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
