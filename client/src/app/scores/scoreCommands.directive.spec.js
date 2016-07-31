(function () {
  'use strict';

  describe('feScoreCommands directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    beforeEach(module('frontendScores'));

    beforeEach(inject(function ($compile, $rootScope) {

      var scores = {sets:[]};
      var view = {show: true};

      scope = $rootScope.$new();
      scope.scores = scores;
      scope.view = view;
      scope.avm = {scores: scope.scores, view: scope.view};
      scope.aloggedIn = true;

      var html = ('<fe-score-commands ' +
      'vm="avm" ' +
      'logged-in="aloggedIn" ' +
      '></fe-score-commands>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('isolated scope', function () {
      it('should have .vm', function () {
        expect(isolatedScope.vm).not.toBeNull();
      });

      it('should have .vm.scores', function () {
        expect(isolatedScope.vm.scores).toBe(scope.scores);
      });

      it('should have .loggedIn', function () {
        expect(isolatedScope.loggedIn).toBe(scope.aloggedIn);
      });

      it('should have .vm.view', function () {
        expect(isolatedScope.vm.view).toBe(scope.view);
      });

      // TODO: Test elements

    });
  });
})();
