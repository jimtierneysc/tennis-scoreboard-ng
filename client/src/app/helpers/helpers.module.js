(function() {
  'use strict';

  angular
    .module('frontend-helpers', ['frontend-components', 'ngSanitize', 'ngAria',
      'toastr', 'ngResource'])
  .constant("baseURL","/api/")


})();
