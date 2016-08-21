(function () {
  'use strict';

  describe('animationTimers service', function () {

    var service;

    beforeEach(module('frontendView'));

    beforeEach(function () {

      inject(function (_animationTimers_) {
        service = _animationTimers_;
      });
    });

    describe('members', function () {

      it('should have .deleayIn', function () {
        expect(server.delayIn).toBe(jasmine.any(Function));
      });

      it('should have .deleayOut', function () {
        expect(server.delayOut).toBe(jasmine.any(Function));
      });
      
      it('should have .digest', function () {
        expect(server.digest).toBe(jasmine.any(Function));
      });
    });
  })
})();

