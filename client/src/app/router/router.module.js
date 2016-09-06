/**
 * @ngdoc overview
 * @name app.router
 * @description
 *
 * # app.router
 *
 * Module to configure ui-router.
 */
(function () {
  'use strict';

  angular
    .module('app.router', ['app.api', 'app.home', 'app.header', 'app.matches', 'app.scores',
      'ui.router']);


})();
