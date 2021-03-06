/**
 * @ngdoc controller
 * @name app.scores.controller:ScoresController
 * @description
 * Controller for listing and selecting matches and for displaying a 
 * drop down menu next to the match list.  
 * Selecting a match updates a child view. 
 * See {@link app.scores.controller:ScoreboardController}
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .controller('ScoresController', Controller);

  /** @ngInject */
  function Controller($filter, $log, $scope, $state, loadingHelper,
                      authHelper, response) {

    var vm = this;

    activate();

    /**
     * @ngdoc function
     * @name activate
     * @methodOf  app.scores.controller:ScoresController
     * @description
     * Initialize the controller:
     * * Add auth support
     * * Add loading support
     * * Add members
     *   * matches - array of matches
     *   * selectedMatch - currently selected match
     *   * selectedMatchChange() - transitions the child view to the selected match
     */
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
      $state.transitionTo('scores.board', {id: vm.selectedMatch.id});
    }
  }
})();




