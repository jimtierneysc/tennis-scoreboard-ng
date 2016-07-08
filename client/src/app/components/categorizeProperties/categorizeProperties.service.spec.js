(function () {
  'use strict';

  describe('service categorizeProperties', function () {
    var service;

    beforeEach(module('frontend'));
    beforeEach(function () {
      inject(function (_categorizeProperties_) {
        service = _categorizeProperties_;
      })
    });

    it('is a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    describe('categorization ', function () {
      it('should support partial match', function () {
        var map = {aprefix: 'acategory'};
        var value = {aprefix_one: 'one', aprefix_two: 'two'}
        var expected = {acategory: ['one', 'two']}
        expect(service(value, map)).toEqual(expected);
      });

      it('makes exact match', function () {
        var map = {aprefix: 'acategory'};
        var value = {aprefix: ['one', 'two']}
        var expected = {acategory: ['one', 'two']}
        expect(service(value, map)).toEqual(expected);
      });

      it('uses implied category', function () {
        var map = {aprefix: null};  // Implies 'aprefix' category
        var value = {aprefix: ['one', 'two']}
        var expected = {aprefix: ['one', 'two']}
        expect(service(value, map)).toEqual(expected);
      });

      it('uses default (other) category', function () {
        var map = {};
        var value = {x: ['one', 'two'], y: 'three'}
        var expected = {other: ['one', 'two', 'three']}
        expect(service(value, map)).toEqual(expected);
      });

      describe('map not required', function () {
        var value;
        var expected;
        beforeEach(function () {
          value = {x: ['one', 'two'], y: 'three'}
          expected = {other: ['one', 'two', 'three']}
        });
        it('supports null map', function () {
          expect(service(value, null)).toEqual(expected);
        });
        it('supports undefined map', function () {
          expect(service(value)).toEqual(expected);
        });
      });
    });

  });
})();

