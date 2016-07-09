(function () {
  'use strict';

  describe('controller players', function () {
    var $controller;
    var $scope;

    var sampleResponse = [
      {
        id: 1
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
      return $controller('PlayersController', obj);
    }

    describe('supports', function () {
      var vm;

      beforeEach(function () {
        vm = playerController(sampleResponse);
      });

      it('supports Auth', function () {
        expect(vm).toSupportAuth();
      });

      it('supports Crud', function () {
        expect(vm).toSupportCrud();
      });

    });

    describe('loading', function () {

      it('did not fail', function () {
        var vm = playerController(sampleResponse);
        // custom matcher
        expect(vm).not.toFailLoading();
      });

      it('did fail', function () {
        var vm = playerController({error: 'something'});
        // custom matcher
        expect(vm).toFailLoading();
      });
    });

    describe('crud interface', function () {
      var crudMock;
      beforeEach(function () {
        crudMock = new CrudMock();
        playerController(sampleResponse, {crudHelper: crudMock.crudHelper})
      });

      it('was activated', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('crud options', function () {
        var options;
        var resourceName;
        beforeEach(function () {
          inject(function (_playersResource_) {
            resourceName = _playersResource_;
          });
          options = crudMock.options;
        });

        it('has options', function () {
          expect(options).toEqual(jasmine.any(Object));
        });

        it('is crud options', function () {
          // custom matcher
          expect(options).toBeCrudOptions();
        });

        it('has .resourceName', function () {
          expect(options.resourceName).toEqual(resourceName);
        });

        describe('.getEntityDisplayName()', function () {

          it('returns name', function () {
            expect(options.getEntityDisplayName({name: 'aplayer'})).toEqual('aplayer');
          });
        });

        describe('.makeEntityBody()', function () {

          it('returns object', function () {
            expect(options.makeEntityBody({})).toEqual({player: {}});
          });
        });

        describe('.prepareToCreateEntity()', function () {

          it('prepares', function () {
            expect(options.prepareToCreateEntity({name: 'aplayer', id: 1})).toEqual({name: 'aplayer'});
          });
        });

        describe('.prepareToUpdateEntity()', function () {
          it('prepares', function () {
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
    };

    _this.crudHelper = activate;

    function activate(vm, options) {
      _this.options = options;

    }

  }
})();
