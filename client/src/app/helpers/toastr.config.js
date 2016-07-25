(function() {
  'use strict';

  angular
    .module('frontend-helpers')
    .config(config);

  /** @ngInject */
  function config(toastrConfig) {
    toastrConfig.allowHtml = false;  // escape '<', etc.
    toastrConfig.timeOut = 0;
    toastrConfig.extendedTimeOut = 0;
    toastrConfig.closeButton = true;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = false;
    toastrConfig.progressBar = false;
    toastrConfig.maxOpened = 1;
  }

})();

