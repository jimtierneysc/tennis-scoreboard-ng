(function() {
  'use strict';

  angular
    .module('frontendRun')
    .run(loadCredentials);

  /** @ngInject */
  function loadCredentials(userCredentials) {
    userCredentials.loadCredentials();
  }

})();
