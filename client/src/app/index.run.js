(function() {
  'use strict';

  angular
    .module('frontend')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, userCredentials) {
    userCredentials.loadCredentials();
  }

})();
