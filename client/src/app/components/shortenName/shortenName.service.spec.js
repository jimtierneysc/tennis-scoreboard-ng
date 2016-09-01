(function () {
  'use strict';

  describe('shortenName service', function () {
    var service;

    beforeEach(module('app.components'));
    beforeEach(function () {
      inject(function (_shortenName_) {
        service = _shortenName_;
      })
    });

    it('should be a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    describe('when canonical name', function () {

      it('should initialize last name', function () {
        var value = 'John Smith';
        var expected = 'John S.';
        expect(service(value)).toEqual(expected);
      });

      it('should ignore spaces', function () {
        var value = ' John   Smith ';
        var expected = 'John S.';
        expect(service(value)).toEqual(expected);
      });

    });

    describe('when initialled names', function () {
      it('should not shorten when first name is initialled', function () {
        var value = 'J. Smith';
        expect(service(value)).toEqual(value);
      });

      it('should not shorten when last name is initialled', function () {
        var value = 'John S.';
        expect(service(value)).toEqual(value);
      });
    });

    describe('when last name is not proper nown', function() {
      it('should not shorten', function() {
        var value = 'John SMITH';
        expect(service(value)).toEqual(value);
      });
    });

    describe('when last name is short', function() {
      it('should not shorten', function() {
        var value = 'John Yo';
        expect(service(value)).toEqual(value);
      });
    });

    describe('when not two names', function () {
      it('should not shorten when one name', function () {
        var value = 'John';
        expect(service(value)).toEqual(value);
      });

      it('should not shorten when more than two names', function () {
        var value = 'John Paul Smith';
        expect(service(value)).toEqual(value);
      });
    });
  });

})();

