/**
 * @ngdoc controller
 * @name ScoresController
 * @description
 * Controller for listing and selecting match scores
 *
 */

(function () {
  'use strict';

  angular
    .module('frontendScores')
    .controller('ScoresController', Controller);

  /** @ngInject */
  function Controller($timeout, $filter, $log, $scope, $state, crudResource, $q, loadingHelper,
                      authHelper, response) {

    var vm = this;

    activate();

    function activate() {
      vm.matches = [];
      vm.selectedMatch = null;
      vm.selectedMatchChange = selectedMatchChange;

      authHelper(vm, $scope);
      loadingHelper(vm);

      if (angular.isArray(response))
        getMatchesSucceeded(response);
      else
        getMatchesFailed(response);
    }

    function getMatchesSucceeded(response) {
      vm.matches = response;
      vm.updateLoadingCompleted();
      selectMatch();
    }

    function getMatchesFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.updateLoadingFailed(response);
    }

    function selectMatch() {
      if ($state.current.name === 'scores.board') {
        var id = $state.params.id;
        var found = $filter('filter')(vm.matches, function (o) {
          return o.id == id;
        });
        if (found.length > 0)
          vm.selectedMatch = found[0];
      }
    }

    function selectedMatchChange() {
      // $log.info('selectedMatchChange');
      // // Kill focus so that keyboard doesn't show on mobile devices
      // // See https://github.com/angular-ui/ui-select/issues/818
      // var timer = $timeout(function () {
      //   var active = $document.prop('activeElement');
      //   if (active.type == 'text') {
      //     $log.info('kill focus');
      //     active.blur();
      //   }
      // }, 1, false);
      // $scope.$on('$destroy', function () {
      //   $timeout.cancel(timer);
      // });
      $state.transitionTo('scores.board', {id: vm.selectedMatch.id});
    }
  }
})();




