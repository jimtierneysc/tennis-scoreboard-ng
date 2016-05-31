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
  function playersFunc($log, $q, playersResource) {

    var service = {
      getSelectOptions: getSelectOptions
    };

    return service;

    // Return a promise
    function getSelectOptions() {
      var deferredObject = $q.defer();
      playersResource.getPlayers().query(
        function (response) {
          $log.info('received data');
          var options = [];
          angular.forEach(response, function (value) {
            options.push({name: value.name, id: value.id});
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
