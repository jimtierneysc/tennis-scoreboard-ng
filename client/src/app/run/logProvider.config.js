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
