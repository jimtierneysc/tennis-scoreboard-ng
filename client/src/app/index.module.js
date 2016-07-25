(function () {
  'use strict';

  angular.module('frontend-run', ['frontend-auth']);
  
  angular.module('app', ['frontend-router', 'frontend-run']);

})();
