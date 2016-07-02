(function () {
  'use strict';

  describe('service waitIndicator', function () {

    var service;

    beforeEach(module('frontend'));

    beforeEach(function () {

      inject(function (waitIndicator) {
        service = waitIndicator;
      });
    });

    it('should be registered', function () {
      expect(service).not.toEqual(null);
    });

    it('should not be waiting', function () {
      expect(service.waiting()).toEqual(false);
    });

    it('should set waiting', function () {
      service.beginWait();
      expect(service.waiting()).toBe(true);
    });

    it('should clear waiting', function () {
      var callBack = service.beginWait();
      callBack();
      expect(service.waiting()).toBe(false);
    })

    it('should ignore underflow', function () {
      var callBack = service.beginWait();
      callBack();
      callBack();
      expect(service.waiting()).toBe(false);
    })

    describe('change notification', function() {
      var scope;
      var spy;
      beforeEach(function () {
        inject(function ($rootScope) {
          scope = $rootScope.$new();
        });
        spy = jasmine.createSpy('changed')
      });

      it('should change when set waiting', function () {
        service.subscribeChanged(scope, spy);
        service.beginWait();
        expect(spy).toHaveBeenCalled();
      });

      it('should change when clear waiting', function () {
        var callBack = service.beginWait();
        service.subscribeChanged(scope, spy);
        callBack();
        expect(spy).toHaveBeenCalled();
      });

      it('should change once with set', function () {
        service.subscribeChanged(scope, spy);
        service.beginWait();
        service.beginWait();
        expect(spy.calls.count()).toEqual(1);
      });

      it('should change once with cleared', function () {
        var callback = service.beginWait();
        service.beginWait();
        service.subscribeChanged(scope, spy);
        callback();
        callback();
        expect(spy.calls.count()).toEqual(1);
      });
    });

    it('should change when clear waiting', function () {
      var callBack = service.beginWait();
      callBack();
      expect(service.waiting()).toBe(false);
    })

    describe('nested waiting', function () {
      var callBack1, callBack2;
      beforeEach(function () {
        callBack1 = service.beginWait();
        callBack2 = service.beginWait();
      });

      it('should be waiting', function () {
        expect(service.waiting()).toBe(true);
      });

      it('should still be waiting', function () {
        callBack1();
        expect(service.waiting()).toBe(true);
      });

      it('should not be waiting', function () {
        callBack1();
        callBack2();
        expect(service.waiting()).toBe(false);

      });
    });

  });
})();
