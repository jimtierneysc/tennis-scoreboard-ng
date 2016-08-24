/**
 * @ngdoc service
 * @name crudResource
 * @description
 * Make CRUD HTTP requests
 *
 */
(function () {
  'use strict';

  angular
    .module('frontendCrud')
    .service('crudResource', Service);

  /** @ngInject */
  function Service($resource, apiPath) {

    var service = this;

    service.getPath = getPath;
    service.getResource = getResource;

    function getPath(resourcePath) {
      return apiPath + resourcePath;
    }

    function getResource(resourcePath) {
      return $resource(getPath(resourcePath) + '/:id', null, {'update': {method: 'PUT'}});
    }
  }
})();
