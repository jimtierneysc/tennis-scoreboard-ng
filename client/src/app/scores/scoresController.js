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
    .module('frontend')
    .controller('ScoresController', Controller);

  /** @ngInject */
  function Controller($filter, $log, $scope, $state, crudResource, $q, loadingHelper,
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
      $state.transitionTo('scores.board', {id: vm.selectedMatch.id});
    }
  }
})();




