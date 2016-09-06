/**
 * @ngdoc directive
 * @name app.components.directive:feLoadingMessage
 * @restrict E
 * @description
 * Displays a loading message if the page is loading.  Displays an
 * error message if the page failed to load.
 *
 */

(function () {
  'use strict';

  angular
    .module('app.components')
    .directive('feLoadingMessages', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/loading/loadingMessages.html',
      scope: {
        loading: '='
      }
    };

    return directive;
  }
})();
