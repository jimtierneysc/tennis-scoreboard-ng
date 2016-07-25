(function() {
  'use strict';

  angular.module('frontend-auth', ['frontend-api', 'frontend-components', 'frontend-helpers',
    'ngAnimate', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ngStorage',
    'ngResource', 'ui.router', 'ui.bootstrap', 'ui.bootstrap.modal'])

  .constant("authHeaderName", "Authorization");


})();
