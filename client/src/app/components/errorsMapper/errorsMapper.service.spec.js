(function () {
  'use strict';

  describe('errorsMapper service', function () {
    var service;

    beforeEach(module('frontendComponents'));
    beforeEach(function () {
      inject(function (_errorsMapper_) {
        service = _errorsMapper_;
      })
    });

    it('should be a function', function () {
      expect(service).toEqual(jasmine.any(Function));
    });

    it('should match names', function () {
      var names = ['x', 'y'];
      var value = {x: ['one', 'two'],  y: 'four'};
      var expected = { x: ['one', 'two'],  y: ['four']};
      expect(service(value, names)).toEqual(expected);
    });

    it('should substitute names', function () {
      var map = {x: 'newx'};
      var names = ['x'];
      var value = {x: 'one'};
      var expected = { newx: ['one']};
      expect(service(value, names, map)).toEqual(expected);
    });

    it('should use default key name', function () {
      var value = {x: 'one'};
      var expected = {other: ['X one']};
      expect(service(value)).toEqual(expected);
    });

    it('should cleanup prefix', function () {
      var value = {remove_underbars: ['one'], remove_underbars_and_id: 'two'}
      var expected = {other: ['Remove underbars one', 'Remove underbars and two']}
      expect(service(value)).toEqual(expected);
    });

    it('should override default key name', function () {
      var value = {x: 'one'};
      var expected = {newdefault: ['X one']};
      expect(service(value, undefined, undefined, 'newdefault')).toEqual(expected);
    });

    it('should not prefix with "other"', function () {
      var value = {other: 'one', x: 'two'};
      var expected = {other: ['one', 'X two']};
      expect(service(value)).toEqual(expected);
    });
  });
})();

