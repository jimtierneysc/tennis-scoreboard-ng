(function () {
  'use strict';

  describe('service crudResource', function () {
    var $httpBackend;
    var sampleData = {name: 'somename'};
    var resourceName = 'aresource';
    var $resource = null;
    var path = null;

    beforeEach(module('frontend'));
    beforeEach(inject(function (crudResource, _$httpBackend_) {
      $resource = crudResource.getResource(resourceName);
      path = crudResource.getPath(resourceName);
      $httpBackend = _$httpBackend_;
    }));

    it('should have resource', function () {
      expect($resource).not.toEqual(null);
    });

    it('should have path', function () {
      expect(path).toMatch(resourceName);
    });

    function backendExpectData(verb, id, fn, code, data) {
      code = code || 200;
      $httpBackend.expect(verb, makePath(id)).respond(200, data);
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

    describe('query', function () {
      it('should return data', function () {
        var data = backendExpectData('GET', null, $resource.query, 200, [sampleData]);
        expect(data[0].name).toEqual(sampleData.name);
      });

      it('should log an error', function () {
        var status = backendExpectStatus('GET', null, $resource.query, 500, [sampleData]);
        expect(status).toEqual(false);
      });
    });

    describe('query item', function () {
      it('should return data', function () {
        var data = backendExpectData('GET', 1, $resource.query, 200, [sampleData]);
        expect(data[0].name).toEqual(sampleData.name);
      });

      it('should log an error', function () {
        var status = backendExpectStatus('GET', 1, $resource.query, 500, [sampleData]);
        expect(status).toEqual(false);
      });
    });

    describe('create', function () {
      it('should return data', function () {
        var data = backendExpectData('POST', null, $resource.save, 200, sampleData);
        expect(data.name).toEqual(sampleData.name);
      });

      it('should log an error', function () {
        var status = backendExpectStatus('POST', null, $resource.save, 500, sampleData);
        expect(status).toEqual(false);
      });
    });

    describe('save item', function () {
      it('should return data', function () {
        var data = backendExpectData('POST', 1, $resource.save, 200, sampleData);
        expect(data.name).toEqual(sampleData.name);
      });

      it('should log an error', function () {
        var status = backendExpectStatus('POST', 1, $resource.save, 500, sampleData);
        expect(status).toEqual(false);
      });
    });

    describe('remove item', function () {
      it('should return data', function () {
        var status = backendExpectStatus('DELETE', 1, $resource.remove, 200);
         expect(status).toEqual(true);
      });

      it('should log an error', function () {
        var status = backendExpectStatus('DELETE', 1, $resource.remove, 500);
        expect(status).toEqual(false);
      });
    });

    describe('update item', function () {
      it('should return data', function () {
        var data = backendExpectData('PUT', 1, $resource.update, 200, sampleData);
        expect(data.name).toEqual(sampleData.name);
      });

      it('should log an error', function () {
        var status = backendExpectStatus('PUT', 1, $resource.update, 500, sampleData);
        expect(status).toEqual(false);
      });
    });
  });
})();

