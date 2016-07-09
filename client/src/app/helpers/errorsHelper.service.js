/**
 * @ngdoc factory
 * @name errorsHelper
 * @description
 * Add error processing to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('errorsHelper', factory);

  /** @ngInject */
  function factory($log, categorizeProperties) {
    return activate;

    function activate(_vm_, errorCategories) {
      // Initialize controller
      var vm = _vm_;
      var helper = new Helper(errorCategories);
      vm.errorsOfResponse = helper.errorsOfResponse;
    }
    
    function Helper(_errorCategories_) {
      
      var errorCategories = _errorCategories_;
      var helper = this;
      
      helper.errorsOfResponse = function(response) {
        var result;
        if (angular.isObject(response.data))
          result = categorizeErrors(response.data);
        else
          result = categorizeErrors({'other': response.statusText});
        return result;
      }

      function categorizeErrors(data) {
        if (angular.isObject(data.errors))
          data = data.errors;
        var errors = categorizeProperties(data, errorCategories);
        return errors;
      }
    }
  }
})();




