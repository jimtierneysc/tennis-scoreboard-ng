(function () {
  'use strict';

  describe('helper auth', function () {

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {

        inject(function (_crudHelper_) {
          service = _crudHelper_;
        })
      });

      it('should be registered', function () {
        expect(service).not.toEqual(null);
      });

      it('should activate', function () {
        expect(service.activate).toEqual(jasmine.any(Function));
      });

      describe('activate with error', function () {
        var scope;
        var vm = {};
        var crudOptions;
        var crudMethods;

        beforeEach(function () {

          inject(function ($rootScope, _waitIndicator_) {
            scope = $rootScope.$new();
          });

          crudMethods = mockBuilder().controllerMethods();
          crudOptions = mockBuilder().controllerOptions(scope, {error: 'error'}, crudMethods, {});
          service.activate(vm, crudOptions);
        });

        it('should have loaded', function () {
          expect(vm.loading).toEqual(false);
        });

        it('should have failed', function () {
          expect(vm.loadingFailed).toEqual(true);
        });

      });

      describe('activate with data', function () {
        var scope;
        var vm = {};
        var entities;
        var originalEntities;
        var crudOptions;
        var crudMethods;
        var waitIndicator;

        beforeEach(function () {

          inject(function ($rootScope, _waitIndicator_) {
            scope = $rootScope.$new();
            waitIndicator = _waitIndicator_;
          });
          spyOn(waitIndicator, 'beginWait').and.callThrough();
          entities = [
            {id: 1, item: 'one'},
            {id: 2, item: 'two'},
            {id: 3, item: 'three'}
          ];

          originalEntities = angular.copy(entities);
          crudMethods = mockBuilder().controllerMethods();
          crudOptions = mockBuilder().controllerOptions(scope, entities, crudMethods, {});
        });

        describe('members', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
          });

          it('should have errors function', function () {
            expect(vm.errorsOfResponse).toEqual(jasmine.any(Function));
          });

          it('should have loading function', function () {
            expect(vm.loadingHasCompleted).toEqual(jasmine.any(Function));
          });

          it('should have toastr function', function () {
            expect(vm.showToastrError).toEqual(jasmine.any(Function));
          });
        });

        describe('loaded', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
          });

          it('should have loaded', function () {
            expect(vm.loading).toEqual(false);
          });

          it('should have not failed', function () {
            expect(vm.loadingFailed).toEqual(false);
          });

        });

        describe('crud create success', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
            spyOn(crudMethods, 'prepareToCreateEntityImpl').and.callThrough();
            vm.newEntity = {name: 'four'};
            vm.submitNewEntity();
          });

          it('should add', function () {
            expect(entities.length).toEqual(originalEntities.length + 1);
            expect(entities[1]).toEqual(originalEntities[0]);
          });

          it('should prepare', function () {
            expect(crudMethods.prepareToCreateEntityImpl).toHaveBeenCalled();
          });

          it('should have no errors', function () {
            expect(vm.entityCreateErrors).toBe(null);
          });

          it('should show wait indicator', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should hide wait indicator', function () {
            expect(waitIndicator.waiting()).toBe(false);
          });
        });

        describe('crud create error', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
            crudMethods.respondWithError = true;
            vm.newEntity = {name: 'four'};
            vm.submitNewEntity();
          });

          it('should fail', function () {
            expect(entities.length).toEqual(originalEntities.length);
          });

          it('should have errors', function () {
            expect(vm.entityCreateErrors).not.toBe(null);
          });

          it('should show wait indicator', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should hide wait indicator', function () {
            expect(waitIndicator.waiting()).toBe(false);
          });

        });

        describe('crud update success', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
            spyOn(crudMethods, 'prepareToUpdateEntityImpl').and.callThrough();
            vm.editEntity = angular.copy(entities[2]);
            vm.editEntity.name = 'xyz'
            vm.submitEditEntity();
          });

          it('should update', function () {
            expect(entities[2].name).toEqual('xyz');
          });

          it('should prepare', function () {
            expect(crudMethods.prepareToUpdateEntityImpl).toHaveBeenCalled();
          });

          it('should have no errors', function () {
            expect(vm.entityUpdateErrors).toBe(null);
          });

          it('should show wait indicator', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should hide wait indicator', function () {
            expect(waitIndicator.waiting()).toBe(false);
          });
        });

        describe('crud update error', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
            crudMethods.respondWithError = true;
            vm.editEntity = angular.copy(entities[2]);
            vm.editEntity.name = 'xyz'
            vm.submitEditEntity();
          });

          it('should fail', function () {
            expect(entities).toEqual(originalEntities);
          });

          it('should have errors', function () {
            expect(vm.entityUpdateErrors).not.toBe(null);
          });

          it('should show wait indicator', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should hide wait indicator', function () {
            expect(waitIndicator.waiting()).toBe(false);
          });
        });

        describe('crud delete success', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
            vm.trashEntity(entities[2], false);
          });

          it('should delete', function () {
            expect(entities.length).toEqual(originalEntities.length - 1);
            expect(entities[2]).toEqual(originalEntities[3]);
          });

          it('should not have toast', function () {
            expect(vm.lastToast).toBe(null);
          });

          it('should show wait indicator', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should hide wait indicator', function () {
            expect(waitIndicator.waiting()).toBe(false);
          });
        });

        describe('crud delete fail', function () {
          beforeEach(function () {
            service.activate(vm, crudOptions);
            crudMethods.respondWithError = true;
            vm.trashEntity(entities[2], false);
          });

          it('should fail', function () {
            expect(entities).toEqual(originalEntities);
          });

          it('should have toast', function () {
            expect(vm.lastToast).not.toBe(null);
          });

          it('should show wait indicator', function () {
            expect(waitIndicator.beginWait).toHaveBeenCalled();
          });

          it('should hide wait indicator', function () {
            expect(waitIndicator.waiting()).toBe(false);
          });

        })


        describe('crud confirm delete', function () {
          var modalConfirm;
          var $q;
          var $rootScope;
          beforeEach(function () {
            inject(function (_modalConfirm_, _$q_, _$rootScope_) {
              modalConfirm = _modalConfirm_;
              $q = _$q_;
              $rootScope = _$rootScope_;
            });
            service.activate(vm, crudOptions);
          });

          it('should open modal', function () {
            spyOn(crudMethods, 'getEntityDisplayNameImpl').and.callThrough();
            spyOn(modalConfirm, 'confirm').and.callThrough();
            vm.trashEntity(entities[2], true);
            expect(crudMethods.getEntityDisplayNameImpl).toHaveBeenCalled();
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });

          it('should wait for confirmation', function () {
            vm.trashEntity(entities[2], true);
            expect(entities).toEqual(originalEntities);
          });

          function returnPromise(resolve) {
            return function() {
              var deferred = $q.defer();
              if (resolve)
                deferred.resolve();
              else
                deferred.reject();
              return deferred.promise;
            }
          }

          it('should delete after confirm', function () {
            spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(true));
            vm.trashEntity(entities[2], true);
            $rootScope.$digest(); // process promise
            expect(entities).not.toEqual(originalEntities);
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });

          it('should not delete after cancel', function () {
            spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(false));
            vm.trashEntity(entities[2], true);
            $rootScope.$digest(); // process promise
            expect(entities).toEqual(originalEntities);
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });

        })


      });

    })
  });


  function mockBuilder() {

    return {
      controllerOptions: controllerOptions,
      controllerMethods: controllerMethods
    };

    function controllerOptions(scope, response, methods, errorCategories) {
      var options =
      {
        response: response,
        getResources: methods.getResource,
        prepareToCreateEntity: methods.prepareToCreateEntity,
        prepareToUpdateEntity: methods.prepareToUpdateEntity,
        beforeshowNewEntity: methods.beforeshowNewEntity,
        beforeshowEditEntity: methods.beforeshowEditEntity,
        getEntityDisplayName: methods.getEntityDisplayName,
        makeEntityBody: methods.makeEntityBody,
        scope: scope,
        errorCategories: errorCategories
      };
      return options;
    }


    function controllerMethods() {

      var methods = new (function () {

        var _this = this;

        _this.respondWithError = false;

        _this.makeEntityBody = function (entity) {
          return entity;
        };

        _this.getEntityDisplayName = function (entity) {
          return _this.getEntityDisplayNameImpl(entity);
        };

        // can spyOn
        _this.getEntityDisplayNameImpl = function (entity) {
          return entity.name;
        };

        _this.beforeShowEntityForm = function () {
        };

        _this.prepareToCreateEntity = function (entity) {
          return _this.prepareToCreateEntityImpl(entity);
        };

        // Can spyOn
        _this.prepareToCreateEntityImpl = function (entity) {
          return entity;
        };

        _this.prepareToUpdateEntity = function (entity) {
          return _this.prepareToUpdateEntityImpl(entity);
        };

        // Can spyOn
        _this.prepareToUpdateEntityImpl = function (entity) {
          return entity;
        };

        _this.getResource = function () {
          var methods;

          if (!_this.respondWithError)
            methods = {
              save: saveResource,
              remove: removeResource,
              update: updateResource
            }
          else
            methods = {
              save: saveResourceError,
              remove: removeResourceError,
              update: updateResourceError
            }

          return methods;

        };
      });

      return methods;
    }

    var nextId = 999;

    function saveResource(item, fn1, fn2) {
      var newItem = angular.copy(item);
      newItem.id = nextId++;
      fn1(newItem);
    }

    function saveResourceError(item, fn1, fn2) {
      fn2({});
    }

    function removeResource(id, fn1, fn2) {
      fn1({})
    }

    function removeResourceError(id, fn1, fn2) {
      fn2({})
    }

    function updateResource(id, item, fn1, fn2) {
      var updateItem = angular.copy(item);
      fn1(item)
    }

    function updateResourceError(id, item, fn1, fn2) {
      fn2({})
    }

  }
})();

