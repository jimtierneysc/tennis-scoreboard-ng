/**
 * @ngdoc overview
 * @name app.header
 * @description
 *
 * # app.header
 *
 * The `app.header` module supports a navbar and login form.
 */
(function() {
  'use strict';

  angular
    .module('app.header', ['app.auth', 'app.components', 'angular-click-outside']);

})();
