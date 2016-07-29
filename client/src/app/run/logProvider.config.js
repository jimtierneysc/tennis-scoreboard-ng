(function() {
  'use strict';

  angular
    .module('frontendRun')
    .config(config);

  /** @ngInject */
  function config($logProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
  }

})();
