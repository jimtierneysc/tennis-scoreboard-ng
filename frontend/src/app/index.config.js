(function() {
  'use strict';

  angular
    .module('frontend')
    .config(config);

  /** @ngInject */
  function config($logProvider, toastrConfig) {
    // Enable log
    $logProvider.debugEnabled(true);

    // toasts are closed by the user
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 0;
    toastrConfig.extendedTimeOut = 0;
    toastrConfig.closeButton = true;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = false;
    toastrConfig.progressBar = false;
  }

})();
