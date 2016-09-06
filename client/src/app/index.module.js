/**
 * @ngdoc overview
 * @name app
 * @description
 *
 * # app
 *
 * The app module references all modules required by the application
 */
(function () {
  'use strict';

  angular.module('app', ['app.router', 'app.run', 'angulartics',
    'angulartics.google.analytics', 'ngAria', 'ngSanitize']);

})();

