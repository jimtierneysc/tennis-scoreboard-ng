(function () {
  'use strict';

  describe('feResponseError directive', function () {
    var compiledDirective;
    var scope;
    var isolatedScope;
    var element;

    var response = {status: 0, statusText: ''};

    function updateResponse(status, statusText, data) {
      response.status = status;
      response.statusText = statusText;
      response.data = data;
    }

    beforeEach(module('frontendComponents'));

    beforeEach(inject(function ($compile, $rootScope) {

      scope = $rootScope.$new();
      scope.aresponse = response;

      var html = ('<fe-response-error ' +
      'error="aresponse" ' +
      '></fe-response-error>');

      element = angular.element(html);

      compiledDirective = $compile(element)(scope);
      scope.$digest();
      isolatedScope = compiledDirective.isolateScope();
    }));

    describe('members', function () {
      var status = 500;
      var statusText = 'text';
      var message = 'message';

      beforeEach(function () {
        updateResponse(status, statusText, message);
      });

      it('should have .status()', function () {
        expect(isolatedScope.vm.status).toEqual(jasmine.any(Function));
      });

      it('should have .statusText()', function () {
        expect(isolatedScope.vm.statusText).toEqual(jasmine.any(Function));
      });

      it('should have .message()', function () {
        expect(isolatedScope.vm.message).toEqual(jasmine.any(Function));
      });

      it('should return .hasMessage()', function () {
        expect(isolatedScope.vm.hasMessage).toEqual(jasmine.any(Function));
      });

      // TODO: Test form elements

    });

    describe('html message', function () {
      beforeEach(function () {
        updateResponse(500, '',
          '<!doctype html>');
      });

      it('should not have message', function () {
        expect(isolatedScope.vm.hasMessage()).toBeFalsy();
      });
    });

    describe('simple message', function () {
      var message = 'hello';
      beforeEach(function () {
        updateResponse(500, '', message);
      });

      it('should have message', function () {
        expect(isolatedScope.vm.hasMessage()).toBeTruthy();
      });

      it('should equal message', function () {
        expect(isolatedScope.vm.message()).toEqual(message);
      });

    });

    describe('json message array', function () {
      var message = 'hello';
      var json = {error: [message] };
      beforeEach(function () {
        updateResponse(500, '', json);
      });

      it('should have message', function () {
        expect(isolatedScope.vm.hasMessage()).toBeTruthy();
      });

      it('should equal message', function () {
        expect(isolatedScope.vm.message()).toEqual(message);
      });

    });

    describe('json message string', function () {
      var message = 'hello';
      var json = {error: message };
      beforeEach(function () {
        updateResponse(500, '', json);
      });

      it('should have message', function () {
        expect(isolatedScope.vm.hasMessage()).toBeTruthy();
      });

      it('should equal message', function () {
        expect(isolatedScope.vm.message()).toEqual(message);
      });
    });

  });
})();
