/**
 * @ngdoc factory
 * @name errorsHelper
 * @description
 * Common functionality shared by CRUD controllers
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .factory('errorsHelper', helperFunc);

  /** @ngInject */
  function helperFunc($log, feUtils) {
    var service = {
      activate: activateFunc
    };
    return service;

    function activateFunc(_vm_, errorCategories) {
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
        var errors = feUtils.categorizeProperties(data, errorCategories);
        return errors;
      }
    }
  }
})();




