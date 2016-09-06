/**
 * @ngdoc directive
 * @name app.scores.directive:feScoreCommands
 * @restrict E
 * @description
 * Display a menu of commands.  Commands to change the view include
 * show completed games, show score keeper commands, and show match description.
 * Commands to change the score include undo and clear.  These two commands are 
 * shown if the end user is logged in
 *
 */

(function () {
  'use strict';

  angular
    .module('app.scores')
    .directive('feScoreCommands', directive);

  /** @ngInject */
  function directive() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/scores/scoreCommands.html',
      scope: {
        vm: '=',
        loggedIn: '='
      }

    };

    return directive;
  }

})();
