/**
 * @ngdoc directive
 * @name app.components.directive:feUiSelectReadOnly
 * @restrict E
 * @description
 * Set the readonly attribute on the input element of a ui-select directive.
 * This is done to prevent the keyboard from showing on Android, when
 * the ui-select is focused.  This directive should only be used
 * when ui-select search-enabled="false", because the user
 * will not be able to type into a readonly ui-select input.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.components')
    .directive('feUiSelectReadOnly', directive);


  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var uiSelectInput = element[0].querySelector('input');
        if (uiSelectInput) {
          // Add readonly attribute with no value
          uiSelectInput.setAttribute('readonly', '')
          uiSelectInput.setAttribute.onfocus("blur(this);");
        }
      }
    };

    return directive;
  }
})();
