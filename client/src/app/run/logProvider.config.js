/**
 * @ngdoc object
 * @name app.run.config:configLogProvider
 * @description
 * Set default options for the $logProvider
 */
(function() {
  'use strict';

  angular
    .module('app.run')
    .config(config);

  /** @ngInject */
  function config($logProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
  }

})();
