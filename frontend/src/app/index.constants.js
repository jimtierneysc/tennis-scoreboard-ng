/* global malarkey:false, moment:false */
(function() {
  'use strict';

  angular
    .module('frontend')
    .constant("baseURL","/api/")
    .constant('malarkey', malarkey)
    .constant('moment', moment)
  ;

})();
