/**
 * @ngdoc service
 * @name matchesSelectOptions
 * @description
 * Provide list of matches for select list
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
      var deferredObject = $q.defer();
      matchesResource.getMatches().query(
        function (response) {
          $log.info('received data');
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.title, id: value.id});
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
