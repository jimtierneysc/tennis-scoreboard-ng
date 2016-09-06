(function () {
  'use strict';

  describe('waitingState service', function () {

    var service;

    beforeEach(module('app.components'));

    beforeEach(function () {

      inject(function (waitingState) {
        service = waitingState;
      });
    });

    it('should not be waiting initially', function () {
      expect(service.waiting()).toEqual(false);
    });

    describe('.beginWait()', function() {

       it('should set .waiting', function () {
        service.beginWait();
        expect(service.waiting()).toBeTruthy();
      });

      it('should clear .waiting', function () {
        var callBack = service.beginWait();
        callBack();
        expect(service.waiting()).toBeFalsy();
      });

      it('should ignore underflow', function () {
        var callBack = service.beginWait();
        callBack();
        callBack();
        expect(service.waiting()).toBeFalsy();
      });
    });

   describe('change notification', function() {
      var scope;
      var spy;
      beforeEach(function () {
        inject(function ($rootScope) {
          scope = $rootScope.$new();
        });
        spy = jasmine.createSpy('changed')
      });

      it('should notify when .beginWait()', function () {
        service.subscribeChanged(scope, spy);
        service.beginWait();
        expect(spy).toHaveBeenCalled();
      });

      it('should notify when clear waiting', function () {
        var callBack = service.beginWait();
        service.subscribeChanged(scope, spy);
        callBack();
        expect(spy).toHaveBeenCalled();
      });

      it('should notify once when .beginWait() twice', function () {
        service.subscribeChanged(scope, spy);
        service.beginWait();
        service.beginWait();
        expect(spy.calls.count()).toEqual(1);
      });

      it('should notify once when clear waiting twice', function () {
        var callback = service.beginWait();
        service.beginWait();
        service.subscribeChanged(scope, spy);
        callback();
        callback();
        expect(spy.calls.count()).toEqual(1);
      });
    });

    describe('nested waiting', function () {
      var callBack1, callBack2;
      beforeEach(function () {
        callBack1 = service.beginWait();
        callBack2 = service.beginWait();
      });

      it('should be waiting', function () {
        expect(service.waiting()).toBeTruthy();
      });

      it('should still be waiting', function () {
        callBack1();
        expect(service.waiting()).toBeTruthy();
      });

      it('should not be waiting', function () {
        callBack1();
        callBack2();
        expect(service.waiting()).toBeFalsy();
      });
    });
  });
})();
