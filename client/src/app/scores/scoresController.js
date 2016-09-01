/**
 * @ngdoc controller
 * @name app.scores.controller:ScoresController
 * @description
 * Controller for listing and selecting match scores
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .controller('ScoresController', Controller);

  /** @ngInject */
  function Controller($filter, $log, $scope, $state, crudResource, $q, loadingHelper,
                      authHelper, $timeout, $document, response) {

    var vm = this;

    activate();

    function activate() {
      vm.matches = [];
      vm.selectedMatch = null;
      vm.selectedMatchChange = selectedMatchChange;

      authHelper(vm, $scope);
      loadingHelper(vm);

      if (angular.isArray(response))
        getMatchesHasSucceeded(response);
      else
        getMatchesHasFailed(response);
    }

    function getMatchesHasSucceeded(response) {
      vm.matches = response;
      vm.loading.hasCompleted();
      selectMatch();
    }

    function getMatchesHasFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.loading.hasFailed(response);
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

      // // Kill focus so that keyboard doesn't show on mobile devices
      // // See https://github.com/angular-ui/ui-select/issues/818
      // var timer = $timeout(function () {
      //   var active = $document.prop('activeElement');
      //   if (active.type == 'text') {
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




