(function () {
  'use strict';

  describe('directive waitIndicator', function () {

    var compile, scope, directiveElem;

    beforeEach(module('frontend'));

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

    it('should have div', function () {
      expect(directiveElem.find('div').length > 1).toBeTruthy();
    });

    it('should be centered', function () {
      var div = directiveElem.find('div')[0];
      expect(div.className).toMatch('screen-center');
    });

    describe('vm', function () {
      var vm;

      beforeEach(function () {
        vm = scope.vm;
      });

      it('should have values', function () {
        expect(vm).not.toEqual(null);
      })

      it('should not be waiting', function () {
        expect(vm.waiting).toBe(false);
      })
    })

    describe('use waitIndicator service', function () {
      var vm;
      var service;
      var $timeout;

      beforeEach(function () {
        inject(function(waitIndicator, _$timeout_){
          service = waitIndicator;
          $timeout = _$timeout_;
        });
        vm = scope.vm;
      });

      it('should set waiting', function () {
        service.beginWait();
        $timeout.flush();
        expect(vm.waiting).toBe(true);
      });

      it('should clear waiting', function () {
        var callBack = service.beginWait();
        $timeout.flush();
        callBack();
        expect(vm.waiting).toBe(false);
      })
    })

  });
})();
