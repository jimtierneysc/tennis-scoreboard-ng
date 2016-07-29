(function () {
  'use strict';

  describe('feWaitIndicator directive', function () {

    var compile, scope, directiveElem;

    beforeEach(module('frontendComponents'));

    beforeEach(function () {

      inject(function ($compile, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
      });

      var html = ('<fe-wait-indicator> ' +
      '</fe-wait-indicator>');

      directiveElem = getCompiledElement(html);
    });

    function getCompiledElement(html) {
      var element = angular.element(html);
      var compiledElement = compile(element)(scope);
      scope.$digest();
      return compiledElement;
    }

    describe('elements', function () {
      it('should have div', function () {
        expect(directiveElem.find('div').length > 1).toBeTruthy();
      });

      it('should be centered', function () {
        var div = directiveElem.find('div')[0];
        expect(div.className).toMatch('screen-center');
      });
    });

    describe('members', function () {
      var vm;

      beforeEach(function () {
        vm = scope.vm;
      });

      it('should have .vm', function () {
        expect(vm).not.toEqual(null);
      });

      it('should have .waiting', function () {
        expect(vm.waiting).toBeFalsy();
      })
    });

    describe('using waitIndicator service', function () {
      var vm;
      var service;
      var $timeout;

      beforeEach(function () {
        inject(function (waitIndicator, _$timeout_) {
          service = waitIndicator;
          $timeout = _$timeout_;
        });
        vm = scope.vm;
      });

      it('should set .waiting', function () {
        service.beginWait();
        $timeout.flush();
        expect(vm.waiting).toBeTruthy();
      });

      it('should clear .waiting', function () {
        var callBack = service.beginWait();
        $timeout.flush();
        callBack();
        expect(vm.waiting).toBeFalsy();
      })
    })

  });
})();
