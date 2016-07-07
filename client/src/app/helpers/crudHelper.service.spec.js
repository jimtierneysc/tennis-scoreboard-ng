(function () {
  'use strict';

  describe('helper crud', function () {

    var mocks;

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;

      beforeEach(function () {

        inject(function (_crudHelper_) {
          service = _crudHelper_;
        })
        mocks = mockFactories();
      });

       it('should register', function () {
        expect(service).toEqual(jasmine.any(Function));
      });

      describe('activate', function () {

        var mockResource;

        beforeEach(function () {
          var crudResource;

          inject(function (_crudResource_) {
            crudResource = _crudResource_;
          });

          mockResource = mocks.mockResource();

          spyOn(crudResource, 'getResource').and.callFake(mockResource.getResource)
        });


        describe('activate with error', function () {
          var scope;
          var vm = {};
          var crudOptions;
          var crudMethods;

          beforeEach(function () {

            inject(function ($rootScope) {
              scope = $rootScope.$new();
            });

            crudMethods = mocks.controllerMethods();
            crudOptions = mocks.controllerOptions(scope, {error: 'error'}, crudMethods, {});

            service(vm, crudOptions);
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
            crudMethods = mocks.controllerMethods();
            crudOptions = mocks.controllerOptions(scope, entities, crudMethods, {});
          });

          describe('supports', function () {
            beforeEach(function () {
              service(vm, crudOptions);
            });

            it('should support loading', function () {
              expect(vm.supportsLoading).toBeTruthy();
            })

            it('should support errors', function () {
              expect(vm.supportsErrors).toBeTruthy();
            })

            it('should support crud', function () {
              expect(vm.supportsCrud).toBeTruthy();
            })

            it('should support toast', function () {
              expect(vm.supportsToastr).toBeTruthy();
            })

          });

          describe('loaded', function () {
            beforeEach(function () {
              service(vm, crudOptions);
            });

            it('should have loaded', function () {
              expect(vm.loading).toEqual(false);
            });

            it('should have not failed', function () {
              expect(vm.loadingFailed).toEqual(false);
            });

          });

          describe('form', function() {
            var editForm;
            var newForm;
            beforeEach(function () {
              service(vm, crudOptions);
              editForm = mocks.mockForm();
              vm.editEntityForm = editForm;
              newForm = mocks.mockForm();
              vm.newEntityForm = newForm;
            });

            describe('show edit', function() {
              beforeEach(function() {
                vm.showEditEntity(entities[0]);
              });

              it('is shown', function() {
                expect(vm.showingEditEntity(entities[0])).toBeTruthy();
              });

              it('should set edit entity', function() {
                expect(vm.editEntity).toEqual(entities[0]);
              });
            });

            describe('hide edit', function() {
              beforeEach(function() {
                vm.showEditEntity(entities[0]);
                spyOn(editForm, '$setPristine').and.callThrough();
                vm.hideEditEntity();
              });

              it('is hidden', function() {
                expect(vm.showingEditEntity(entities[0])).toBeFalsey;
              });

              it('sets pristine', function() {
                expect(editForm.$setPristine).toHaveBeenCalled();
              });
            });

            describe('show new', function() {
              beforeEach(function() {
                vm.showNewEntity();
              });

              it('is shown', function() {
                expect(vm.showingNewEntity).toBeTruthy;
              });

              it('should set new entity', function() {
                expect(vm.newEntity).toEqual({});
              });
            });

            describe('hide new', function() {
              beforeEach(function() {
                vm.showNewEntity();
                spyOn(newForm, '$setPristine').and.callThrough();
                vm.hideNewEntity();
              });

              it('is hidden', function() {
                expect(vm.showingNewEntity).toBeFalsy();
              });

              it('sets pristine', function() {
                expect(newForm.$setPristine).toHaveBeenCalled();
              });
            });

          });

          describe('crud create success', function () {
            beforeEach(function () {
              service(vm, crudOptions);
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
              expect(waitIndicator.waiting()).toBeFalsy();
            });
          });

          describe('crud create error', function () {
            beforeEach(function () {
              service(vm, crudOptions);
              mockResource.respondWithError = true;
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
              expect(waitIndicator.waiting()).toBeFalsy();
            });

          });

          describe('crud update success', function () {
            beforeEach(function () {
              service(vm, crudOptions);
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
              expect(waitIndicator.waiting()).toBeFalsy();
            });
          });

          describe('crud update error', function () {
            beforeEach(function () {
              service(vm, crudOptions);
              mockResource.respondWithError = true;
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
              expect(waitIndicator.waiting()).toBeFalsy();
            });
          });

          describe('crud delete success', function () {
            beforeEach(function () {
              service(vm, crudOptions);
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
              expect(waitIndicator.waiting()).toBeFalsy();
            });
          });

          describe('crud delete fail', function () {
            var message;
            beforeEach(function () {
              service(vm, crudOptions);
              vm.showToastrError = function (_message_) {
                message = _message_;
              };
              mockResource.respondWithError = true;
              vm.trashEntity(entities[2], false);
            });

            it('should fail', function () {
              expect(entities).toEqual(originalEntities);
            });

            it('should show wait indicator', function () {
              expect(waitIndicator.beginWait).toHaveBeenCalled();
            });

            it('should hide wait indicator', function () {
              expect(waitIndicator.waiting()).toBeFalsy();
            });

            it('should display message', function () {
              expect(message).toBe(mockResource.firstError);
            });

          });

          describe('crude delete error toast', function() {
            beforeEach(function () {
              service(vm, crudOptions);
              mockResource.respondWithError = true;
              vm.trashEntity(entities[2], false);
            });

            it('should have toast', function () {
              expect(vm.lastToast).not.toBe(null);
            });
          });


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
              service(vm, crudOptions);
            });

            describe('open modal', function () {
              beforeEach(function () {
                spyOn(crudMethods, 'getEntityDisplayNameImpl').and.callThrough();
                spyOn(modalConfirm, 'confirm').and.callThrough();
                vm.trashEntity(entities[2]);
              });

              it('should getDisplayName', function () {
                expect(crudMethods.getEntityDisplayNameImpl).toHaveBeenCalled();
              });

              it('should open modal', function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });
            });

            function returnPromise(resolve) {
              return function () {
                var deferred = $q.defer();
                if (resolve)
                  deferred.resolve();
                else
                  deferred.reject();
                return deferred.promise;
              }
            }

            describe('confirm delete', function () {
              beforeEach(function () {
                spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(true));
                vm.trashEntity(entities[2], true);
                $rootScope.$digest(); // process promise
              });

              it('should change entities', function () {
                expect(entities).not.toEqual(originalEntities);

              });

              it('should confirm', function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });
            });

            describe('confirm cancel', function () {
              beforeEach(function () {
                spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(false));
                vm.trashEntity(entities[2], true);
                $rootScope.$digest(); // process promise
              });

              it('should change entities', function () {
                expect(entities).toEqual(originalEntities);
              });

              it('should confirm', function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });
            });

          });

        });
      });
    })


  });


  function mockFactories() {

    return {
      controllerOptions: controllerOptions,
      controllerMethods: function () {
        return new ControllerMethods()
      },
      mockResource: function () {
        return new MockResource();
      },
      mockForm: function() {
        return new MockForm();
      }
    };

    function controllerOptions(scope, response, methods, errorCategories) {
      var options =
      {
        response: response,
        resourceName: 'someresource',
        prepareToCreateEntity: methods.prepareToCreateEntity,
        prepareToUpdateEntity: methods.prepareToUpdateEntity,
        beforeShowNewEntity: methods.beforeShowNewEntity,
        beforeShowEditEntity: methods.beforeShowEditEntity,
        getEntityDisplayName: methods.getEntityDisplayName,
        makeEntityBody: methods.makeEntityBody,
        scope: scope,
        errorCategories: errorCategories
      };
      return options;
    }


    function ControllerMethods() {

      var _this = this;

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
    }

    function MockForm() {
      var _this = this;

      _this.$setPristine = function() {

      }
    }

    function MockResource() {

      var _this = this;

      _this.respondWithError = false;

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

      _this.firstError = 'some error';

      _this.errors = {
        data: {
          someerror: _this.firstError,
          another: 'another error'
        }
      };

      var nextId = 999;

      function saveResource(item, fn1, fn2) { // eslint-disable-line
        var newItem = angular.copy(item);
        newItem.id = nextId++;
        fn1(newItem);
      }

      function saveResourceError(item, fn1, fn2) { // eslint-disable-line
        fn2(_this.errors);
      }

      function removeResource(id, fn1, fn2) { // eslint-disable-line
        fn1({})
      }

      function removeResourceError(id, fn1, fn2) { // eslint-disable-line
        fn2(_this.errors)
      }

      function updateResource(id, item, fn1, fn2) { // eslint-disable-line
        var updateItem = angular.copy(item);
        fn1(updateItem)
      }

      function updateResourceError(id, item, fn1, fn2) { // eslint-disable-line
        fn2(_this.errors)
      }

    }
  }
})
();

