(function() {
  'use strict';

  describe('service categorizeProperties', function() {
    var service;

    beforeEach(module('frontend'));
    beforeEach(function() {
      inject(function(_categorizeProperties_) {
        service = _categorizeProperties_;
      })
    });

    it('should be registered', function() {
      expect(service).not.toEqual(null);
    });

    describe('members', function() {
      it('should have function', function() {
        expect(service).toEqual(jasmine.any(Function));
      });
    });

    describe('categorization ', function() {
      it('should support partial match', function() {
        var map = {aprefix: 'acategory'};
        var value = {aprefix_one: 'one', aprefix_two: 'two'}
        var expected = {acategory: ['one', 'two']}
        expect(service(value, map)).toEqual(expected);
      });

      it('should support exact match', function() {
        var map = {aprefix: 'acategory'};
        var value = {aprefix: ['one', 'two']}
        var expected = {acategory: ['one', 'two']}
        expect(service(value, map)).toEqual(expected);
      });

      it('should support implicit category', function() {
        var map = {aprefix: null};
        var value = {aprefix: ['one', 'two']}
        var expected = {aprefix: ['one', 'two']}
        expect(service(value, map)).toEqual(expected);
      });

      it('should support default category', function() {
        var map = {};
        var value = {x: ['one', 'two'], y: 'three'}
        var expected = {other: ['one', 'two', 'three']}
        expect(service(value, map)).toEqual(expected);
      });
    });

  });
})();

