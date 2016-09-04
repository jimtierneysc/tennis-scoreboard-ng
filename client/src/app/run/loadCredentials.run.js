(function() {
  'use strict';

  angular
    .module('app.run')
    .run(loadCredentials);

  /** @ngInject */
  function loadCredentials(userCredentials) {
    userCredentials.loadCredentials(true);
  }

})();
