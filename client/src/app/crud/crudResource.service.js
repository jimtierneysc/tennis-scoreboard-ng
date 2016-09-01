/**
 * @ngdoc service
 * @name app.crud.crudResource
 * @description
 * Make CRUD REST API requests
 *
 */
(function () {
  'use strict';

  angular
    .module('app.crud')
    .factory('crudResource', factory);

  /** @ngInject */
  function factory($resource, apiPath) {

    var service = {
      getPath: getPath,
      /**
       * @ngdoc function
       * @name getResource
       * @methodOf app.crud.crudResource
       * @description
       * Get a $resource for making a REST API request to a particular resource
       * @param {String} resourcePath
       * (e.g.; 'players')
       * @returns {Object} $resource
       */
      getResource: getResource
    };

    return service;

    function getPath(resourcePath) {
      return apiPath + resourcePath;
    }

    function getResource(resourcePath) {
      return $resource(getPath(resourcePath) + '/:id', null, {'update': {method: 'PUT'}});
    }
  }
})();
