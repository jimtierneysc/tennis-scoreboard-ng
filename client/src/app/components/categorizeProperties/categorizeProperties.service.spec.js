(function () {
  'use strict';

  describe('categorizeProperties service', function () {
    var service;

    beforeEach(module('frontend'));
    beforeEach(function () {
      inject(function (_categorizeProperties_) {
        service = _categorizeProperties_;
      })
    });

    it('should be a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    it('should support partial match', function () {
      var map = {aprefix: 'acategory'};
      var value = {aprefix_one: 'one', aprefix_two: 'two'}
      var expected = {acategory: ['one', 'two']}
      expect(service(value, map)).toEqual(expected);
    });

    it('should support exact match', function () {
      var map = {aprefix: 'acategory'};
      var value = {aprefix: ['one', 'two']}
      var expected = {acategory: ['one', 'two']}
      expect(service(value, map)).toEqual(expected);
    });

    it('should use implied category', function () {
      var map = {aprefix: null};  // Implies 'aprefix' category
      var value = {aprefix: ['one', 'two']}
      var expected = {aprefix: ['one', 'two']}
      expect(service(value, map)).toEqual(expected);
    });

    it('should use "other" category', function () {
      var map = {};
      var value = {x: ['one', 'two'], y: 'three'}
      var expected = {other: ['one', 'two', 'three']}
      expect(service(value, map)).toEqual(expected);
    });

    describe('missing map parameter', function () {
      var value;
      var expected;
      beforeEach(function () {
        value = {x: ['one', 'two'], y: 'three'}
        expected = {other: ['one', 'two', 'three']}
      });
      it('should supports null map parameter', function () {
        expect(service(value, null)).toEqual(expected);
      });
      it('supports undefined map parameter', function () {
        expect(service(value)).toEqual(expected);
      });
    });
  });
})();

