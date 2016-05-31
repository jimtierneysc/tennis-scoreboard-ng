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
    .controller('ScoreController', MainController);

  /** @ngInject */
  function MainController($log, $filter, $state, matchesResource, $q, loadingHelper) {


    var vm = this;
    vm.matches = [];
    vm.selectedMatch = null;
    vm.selectedMatchChange = selectedMatchChange;

    activate();

    function activate() {

      loadingHelper.activate(vm);

      getMatches();


    }

    function getMatches() {
      matchesResource.getMatches().query(
        function (response) {
          $log.info('received data');
          vm.matches = response;
          vm.loadingHasCompleted();
          selectMatch();
        },
        function (response) {
          $log.info('data error ' + response.status + " " + response.statusText);
          vm.loadingHasFailed(response);
        }
      );
    }

    function selectMatch() {
      var state = $state;
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




