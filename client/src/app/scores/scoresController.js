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
  function MainController($log, $filter, $state, $timeout, $document, matchesResource, $q, loadingHelper,
                          waitIndicator, response) {


    var vm = this;
    vm.matches = [];
    vm.selectedMatch = null;
    vm.selectedMatchChange = selectedMatchChange;

    activate();

    function activate() {

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
      matchesResource.getMatches().query(
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
      $log.info('selectedMatchChange');
      // Kill focus so that keyboard doesn't show on mobile devices
      // See https://github.com/angular-ui/ui-select/issues/818
      $timeout(function(){
        var active = $document.prop('activeElement');
        if (active.type == 'text') {
          $log.info('kill focus');
          active.blur();
        }        
      },1,false);
      $state.transitionTo('scores.board', {id: vm.selectedMatch.id});
    }
  }
})();




