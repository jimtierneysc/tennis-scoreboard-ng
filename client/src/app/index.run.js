(function() {
  'use strict';

  angular
    .module('frontend-run')
    .run(runBlock);

  /** @ngInject */
  function runBlock(userCredentials) {
    userCredentials.loadCredentials();
  }

})();
