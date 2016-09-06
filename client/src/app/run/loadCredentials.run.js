/**
 * @ngdoc object
 * @name app.run.run:loadCredentials
 * @description
 * Load the user credentials from local storage when
 * the application is initialized
 */(function() {
  'use strict';

  angular
    .module('app.run')
    .run(loadCredentials);

  /** @ngInject */
  function loadCredentials(userCredentials) {
    userCredentials.loadCredentials(true);
  }

})();
