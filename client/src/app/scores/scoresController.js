/**
 * @ngdoc controller
 * @name ScoreController
 * @description
 * Controller for displaying scores
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend')
    .controller('ScoreController', Controller);

  /** @ngInject */
  function Controller($log, $filter, $scope, $state, crudResource, $q, loadingHelper, 
                         authHelper, waitIndicator, response) {
    
    var vm = this;

    activate();

    function activate() {
      vm.matches = [];
      vm.selectedMatch = null;
      vm.selectedMatchChange = selectedMatchChange;

      authHelper.activate(vm, $scope);
      loadingHelper.activate(vm);

      if (response) {
        if (angular.isArray(response))
          getMatchesSucceeded(response);
        else
          getMatchesFailed(response);
      }
      else
        getMatches();
    }

    function getMatches() {
      var endWait = waitIndicator.beginWait();
      crudResource.getResource('matches').query(
        function (response) {
          endWait();
          getMatchesSucceeded(response);
        },
        function (response) {
          endWait();
          getMatchesFailed(response);
        }
      );
    }

    function getMatchesSucceeded(response) {
      $log.info('received data');
      vm.matches = response;
      vm.loadingHasCompleted();
      selectMatch();
    }

    function getMatchesFailed(response) {
      $log.info('data error ' + response.status + " " + response.statusText);
      vm.loadingHasFailed(response);
    }

    function selectMatch() {
      if (angular.isDefined($state.current.name)) {
        if ($state.current.name == 'scores.board') {
          var id = $state.params.id;
          var found = $filter('filter')(vm.matches, function (o) {
            return o.id == id;
          });
          if (found)
            vm.selectedMatch = found[0];
        }
      }
    }

    function selectedMatchChange() {
      $log.info('selectedMatchChange')
      $state.transitionTo('scores.board', {id: vm.selectedMatch.id});
    }
  }
})();




