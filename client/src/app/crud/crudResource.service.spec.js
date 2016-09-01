(function () {
  'use strict';

  describe('crudResource service', function () {
    var $httpBackend;
    var sampleData = {name: 'somename'};
    var resourceName = 'aresource';
    var $resource = null;
    var path = null;

    beforeEach(module('app.crud'));

    beforeEach(inject(function (crudResource, _$httpBackend_) {
      $resource = crudResource.getResource(resourceName);
      path = crudResource.getPath(resourceName);
      $httpBackend = _$httpBackend_;
    }));

    it('should have path', function () {
      expect(path).toMatch(resourceName);
    });

    describe('query', function () {
      expectSampleDataArray('GET', null, 'query');
    });

    describe('query item', function () {
      expectSampleDataArray('GET', 1, 'query');
    });

    describe('create', function () {
      expectSampleDataObject('POST', null, 'save');
    });

    describe('save item', function () {
      expectSampleDataObject('POST', 1, 'save');
    });

    describe('remove item', function () {
      expectStatus('DELETE', 1, 'remove');
    });

    describe('update item', function () {
      expectSampleDataObject('PUT', 1, 'update');
    });

    function expectSampleDataArray(verb, id, fnName) {
      var fn;
      beforeEach(function() {
        fn = $resource[fnName];
      });

      it('should return data', function () {
        var data = backendExpectData(verb, id, fn, 200, [sampleData]);
        expect(data[0].name).toEqual(sampleData.name);
      });

      it('should return an error', function () {
        var status = backendExpectStatus(verb, id, fn, 500, [sampleData]);
        expect(status).toEqual(false);
      });
    }

    function expectSampleDataObject(verb, id, fnName) {
      var fn;
      beforeEach(function() {
        fn = $resource[fnName];
      });

      it('should return data', function () {
        var data = backendExpectData(verb, id, fn, 200, sampleData);
        expect(data.name).toEqual(sampleData.name);
      });

      it('should return an error', function () {
        var status = backendExpectStatus(verb, id, fn, 500, sampleData);
        expect(status).toEqual(false);
      });
    }

    function expectStatus(verb, id, fnName) {
      var fn;
      beforeEach(function() {
        fn = $resource[fnName];
      });

      it('should return data', function () {
        var status = backendExpectStatus(verb, id, fn, 200);
        expect(status).toEqual(true);
      });

      it('should return an error', function () {
        var status = backendExpectStatus(verb, id, fn, 500);
        expect(status).toEqual(false);
      });
    }

    function backendExpectData(verb, id, fn, code, data) {
      code = code || 200;
      $httpBackend.expect(verb, makePath(id)).respond(code, data);
      var result = null;
      fn(makeKey(id), data,
        function (response) {
          result = response;
        },
        function () {
        }
      );
      $httpBackend.flush();
      return result;
    }

    function backendExpectStatus(verb, id, fn, code, data) {
      code = code || 200;
      $httpBackend.expect(verb, makePath(id)).respond(code, data);
      var result = null;
      fn(makeKey(id), data,
        function () {
          result = true;
        },
        function () {
          result = false;
        }
      );
      $httpBackend.flush();
      return result;
    }

    function makePath(id) {
      if (id)
        return path + '/' + id;
      else
        return path;
    }

    function makeKey(id) {
      if (id) {
        return {id: id};
      }
      else
        return undefined;
    }
  });
})();

