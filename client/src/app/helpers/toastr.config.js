(function() {
  'use strict';

  angular
    .module('frontend')
    .config(config);

  /** @ngInject */
  function config(toastrConfig) {
    // toasts are closed by the user
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 0;
    toastrConfig.extendedTimeOut = 0;
    toastrConfig.closeButton = true;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = false;
    toastrConfig.progressBar = false;
    toastrConfig.maxOpened = 1;
  }

})();

