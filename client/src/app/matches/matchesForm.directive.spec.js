(function () {
  'use strict';

  fdescribe('feMatchesForm directive', function () {
    var compiledDirective;
    var scope;
    var okText;
    var isolatedScope;
    var element;

    beforeEach(module('frontend-matches'));

    beforeEach(inject(function ($compile, $rootScope) {

      var errors = {
        other: ['othererror'],
        name: ['nameerror']
      };
      var entity = {title: 'atitle', doubles: true};
      okText = 'clickme';
      var players = [{name: 'one', id: 1}];
      var teams = angular.copy(players);

      scope = $rootScope.$new();
      scope.aform = null;
      scope.aentity = entity;
      scope.ateams = teams;
      scope.aplayers = players;
      scope.aerrors = errors; // errors;
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
      it('should not be null', function () {
        expect(isolatedScope).not.toBe(null);
      });

      describe('members', function () {
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
      });

      // TODO: validate HTML elements
    });
  });
})();
