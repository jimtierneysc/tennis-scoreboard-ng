(function () {
  'use strict';

  describe('feMatchesForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('frontendMatches'));

    beforeEach(inject(function ($compile, $rootScope) {

      okText = 'clickme';

      scope = $rootScope.$new();
      scope.aform = null;
      scope.aentity = {};
      scope.ateams = [];
      scope.aplayers = [];
      scope.aerrors = {};
      scope.asubmit = jasmine.createSpy('onSubmit');
      scope.acancel = jasmine.createSpy('onCancel');

      var html = ('<fe-matches-form ' +
      'form="aform" ' +
      'errors="aerrors" ' +
      'cancel="acancel()" ' +
      'submit="asubmit()" ' +
      'entity="aentity" ' +
      'players-list="aplayers" ' +
      'teams-list="ateams" ' +
      'ok="' + okText + '"' +
      '></fe-matches-form>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));


    describe('isolated scope', function () {

      it('should have .form', function () {
        expect(isolatedScope.form).toEqual(scope.aform);
      });

      it('should have .errors', function () {
        expect(isolatedScope.errors).toBe(scope.aerrors);
      });

      it('should have .entity', function () {
        expect(isolatedScope.entity).toBe(scope.aentity);
      });

      it('should have .playersList', function () {
        expect(isolatedScope.playersList).toBe(scope.aplayers);
      });

      it('should have .teamsList', function () {
        expect(isolatedScope.teamsList).toBe(scope.ateams);
      });

      it('should call .cancel()', function () {
        isolatedScope.cancel();
        expect(scope.acancel).toHaveBeenCalled();
      });

      it('should call .submit()', function () {
        isolatedScope.submit();
        expect(scope.asubmit).toHaveBeenCalled();
      });

      it('should have ok text', function () {
        expect(isolatedScope.ok).toEqual(okText);
      });

      // TODO: validate HTML elements
    });
  });
})();
