/**
 * @ngdoc overview
 * @name frontendCrud
 * @description
 *
 * # frontendCrud
 *
 * The `frontendCrud` module provides shared code for implementing
 * a view to create, read, update and delete entities.
 */
(function() {
  'use strict';

  angular
    .module('frontendCrud', ['frontendApi', 'frontendComponents', 'frontendAnimation', 'frontendAuth',
      'ngResource']);

})();
