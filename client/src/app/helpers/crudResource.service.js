/**
 * @ngdoc service
 * @name crudResource
 * @description
 * Base for crud resource services
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend-helpers')
    .service('crudResource', Service);

  /** @ngInject */
  function Service($resource, baseURL) {

    var service = this;

    service.getPath = getPath;
    service.getResource = getResource;

    function getPath(name) {
      return baseURL + name;
    }

    function getResource(name) {
      return $resource(getPath(name) + '/:id', null, {'update': {method: 'PUT'}});
    }
  }
})();
