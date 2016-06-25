(function() {
  'use strict';

  angular
    .module('frontend')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, authenticationService) {
    authenticationService.loadCredentials();
  }

})();
