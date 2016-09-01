(function () {
  'use strict';

  describe('PlayersController', function () {
    var $controller;
    var $scope;
    var $rootScope;

    var sampleResponse = [
      {
        id: 1
      }
    ];

    beforeEach(module('app.players'));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
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

      it('should support Auth', function () {
        expect(vm).toSupportAuth();
      });

      it('should support Crud', function () {
        expect(vm).toSupportCrud();
      });

    });

    describe('loading', function () {

      it('should not fail', function () {
        var vm = playerController(sampleResponse);
        // custom matcher
        expect(vm).not.toFailLoading();
      });

      it('should fail', function () {
        var vm = playerController({error: 'something'});
        // custom matcher
        expect(vm).toFailLoading();
      });
    });

    describe('crud', function () {
      var crudMock;
      beforeEach(function () {
        crudMock = new CrudMock();
        playerController(sampleResponse, {crudHelper: crudMock.crudHelper})
      });

      it('should be activated', function () {
        expect(crudMock.activated()).toBeTruthy();
      });

      describe('options', function () {
        var options;
        var resourceName;
        beforeEach(function () {
          inject(function (_playersPath_) {
            resourceName = _playersPath_;
          });
          options = crudMock.options;
        });

        it('should have options', function () {
          expect(options).toEqual(jasmine.any(Object));
        });

        it('should be crud options', function () {
          // custom matcher
          expect(options).toBeCrudOptions();
        });

        it('should have .resourceName', function () {
          expect(options.resourceName).toEqual(resourceName);
        });

        it('should have .entityKind', function () {
          expect(options.entityKind).toEqual('Player');
        });

        describe('.getEntityDisplayName()', function () {

          it('should return name', function () {
            expect(options.getEntityDisplayName({name: 'aplayer'})).toEqual('aplayer');
          });
        });

        describe('.makeEntityBody()', function () {

          it('should return object', function () {
            expect(options.makeEntityBody({})).toEqual({player: {}});
          });
        });
        
        describe('.prepareToCreateEntity()', function () {

          it('should prepare', function () {
            expect(options.prepareToCreateEntity({name: 'aplayer', id: 1})).toEqual({name: 'aplayer'});
          });
        });

        describe('.beforeShowNewEntity()', function () {
          var resolved = false;
          beforeEach(function () {
            options.beforeShowNewEntity().then(function () {
              resolved = true;
            });
            $rootScope.$digest();
          });
          it('should return resolved promise', function () {
            expect(resolved).toBeTruthy();
          });
        });

        describe('.beforeShowEditEntity()', function () {
          var resolved = false;
          beforeEach(function () {
            options.beforeShowEditEntity().then(function () {
              resolved = true;
            });
            $rootScope.$digest();
          });
          it('should return resolved promise', function () {
            expect(resolved).toBeTruthy();
          });
        });

        describe('.prepareToUpdateEntity()', function () {
          it('should prepare', function () {
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
