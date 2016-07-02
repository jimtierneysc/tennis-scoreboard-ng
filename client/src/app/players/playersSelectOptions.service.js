/**
 * @ngdoc service
 * @name playersSelectOptions
 * @description
 * Provide list of players for select list
 *
 */
(function() {
  'use strict';

  angular
    .module('frontend')
    .factory('playersSelectOptions', playersFunc);

  /** @ngInject */
  function playersFunc($log, $q, crudResource, playersResource) {

    var service = {
      getSelectOptions: getSelectOptions
    };

    return service;

    // Return a promise
    function getSelectOptions() {
      var deferredObject = $q.defer();
      crudResource.getResource(playersResource).query(
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
