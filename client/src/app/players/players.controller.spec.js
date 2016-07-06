(function () {
  'use strict';

  describe('controller players', function () {
    var $controller;
    var $scope;

    var sampleResponse = [
      {
        id: 1,
        name: "xyz"
      }
    ];

    beforeEach(module('frontend'));
    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
    }));


    function playerController(response, options) {
      var obj = {
        $scope: $scope,
        response: response
      };
      if (options)
        angular.merge(obj, options);
      var vm = $controller('PlayerController', obj);

      return vm;
    }


    describe('supports', function () {
      var vm;

      beforeEach(function () {
        vm = playerController(sampleResponse);
      });

      it('should support auth', function () {
        expect(vm.supportsAuth).toBeTruthy();
      });

      it('should support crud', function () {
        expect(vm.supportsCrud).toBeTruthy();
      });

    });

    describe('loading', function () {

      it('should load', function () {
        var vm = playerController(sampleResponse);
        expect(vm.loadingFailed).toBeFalsy();
      });

      it('should fail', function () {
        var vm = playerController({error: 'something'});
        expect(vm.loadingFailed).toBeTruthy();
      });
    });

    describe('crud interface', function () {
      var crudMock;
      beforeEach(function () {
        crudMock = new CrudMock();
        playerController(sampleResponse, {crudHelper: crudMock.crudHelper})
      });

      it('should activate mock', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('crud options', function () {
        var options;
        beforeEach(function () {
          options = crudMock.options;
        });

        it('should have options', function () {
          expect(options).toEqual(jasmine.any(Object));
        });

        it('should have resource name', function () {
          expect(options.resourceName).toEqual('players');
        });

        it('should have prepareToCreateEntity', function () {
          expect(options.prepareToCreateEntity).toEqual(jasmine.any(Function));
        });

        it('should have prepareToUpdateEntity', function () {
          expect(options.prepareToUpdateEntity).toEqual(jasmine.any(Function));
        });

        it('should not have beforeShowNewEntity', function () {
          expect(options.beforeShowNewEntity).toBe(null);
        });

        it('should not have beforeShowEditEntity', function () {
          expect(options.beforeShowEditEntity).toBe(null);
        });

        it('should have getEntityDisplayName', function () {
          expect(options.getEntityDisplayName).toEqual(jasmine.any(Function));
        });

        it('should have makeEntityBody', function () {
          expect(options.makeEntityBody).toEqual(jasmine.any(Function));
        });

        it('should have scope', function () {
          expect(options.scope).toEqual(jasmine.any(Object));
        });

        it('should have errorCategories', function () {
          expect(options.errorCategories).toEqual(jasmine.any(Object));
        });

        describe('getEntityDisplayName', function () {

          it('should return name', function () {
            expect(options.getEntityDisplayName({name: 'aplayer'})).toEqual('aplayer');
          });

        });

        describe('makeEntityBody', function () {

          it('should return value', function () {
            expect(options.makeEntityBody({})).toEqual({player: {}});
          });

        });

        describe('prepareToCreateEntity', function () {

          it('should return value', function () {
            expect(options.prepareToCreateEntity({name: 'aplayer', id: 1})).toEqual({name: 'aplayer'});
          });

        });

        describe('prepareToUpdateEntity', function () {

          it('should return value', function () {
            expect(options.prepareToUpdateEntity({name: 'aplayer', id: 1})).toEqual({id: 1, name: 'aplayer'});
          });

        });
      });

    });
  });


  function CrudMock() {

    var _this = this;

    _this.options = null;
    _this.activated = function () {
      return (_this.options != null);
    }

    _this.crudHelper = activate;

    function activate(vm, options) {
      _this.options = options;

    }

  }
})();
