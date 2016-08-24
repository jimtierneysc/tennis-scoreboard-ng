(function () {
  'use strict';

  describe('animationTimers service', function () {

    var service;
    var $timeout;

    beforeEach(module('frontendAnimation'));

    beforeEach(function () {

      inject(function (_animationTimers_, _$rootScope_, _$timeout_) {
        service = _animationTimers_;
        $timeout = _$timeout_;
      });
    });

    describe('members', function () {

      it('should have .delayIn()', function () {
        expect(service.delayIn).toEqual(jasmine.any(Function));
      });

      it('should have .delayOut()', function () {
        expect(service.delayOut).toEqual(jasmine.any(Function));
      });

      it('should have .digest()', function () {
        expect(service.digest).toEqual(jasmine.any(Function));
      });
    });

    describe('promises', function () {
      var executed;
      beforeEach(function() {
        executed = false;
      });

      function execute() {
        executed = true;
      }

      it('should execute .delayIn()', function () {
        service.delayIn().then(execute);
        $timeout.flush();
        expect(executed).toBeTruthy();
      });

      it('should execute .delayOut()', function () {
        service.delayOut().then(execute);
        $timeout.flush();
        expect(executed).toBeTruthy();
      });

      it('should execute .digest()', function () {
        service.digest().then(execute);
        $timeout.flush();
        expect(executed).toBeTruthy();
      });
    });
  })
})();

