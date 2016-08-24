(function () {
  'use strict';

  describe('crudHelper service', function () {

    var mocks;
    var service;
    var mockResource;
    var $q;
    var $rootScope;
    var modalConfirm;
    var autoFocus;

    beforeEach(module('frontendCrud'));

    beforeEach(function () {
      module(function ($provide) {
        autoFocus = jasmine.createSpy('autoFocus');
        // Mock autoFocus service
        $provide.factory('autoFocus', function () {
          return autoFocus;
        });
      });
    });

    function resolvedPromise() {
      return $q.resolve();
    }

    beforeEach(function () {
      module(function ($provide) {
        // Disable animation delays
        $provide.factory('animationTimers', function () {
          return {
            delayIn: resolvedPromise,
            delayOut: resolvedPromise,
            digest: resolvedPromise
          }
        });
      });
    });

    beforeEach(function () {

      inject(function (_crudHelper_, _$rootScope_, _$q_, _modalConfirm_) {
        service = _crudHelper_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        modalConfirm = _modalConfirm_;

      });
      mocks = mockFactories();
    });

    beforeEach(function () {
      var crudResource;

      inject(function (_crudResource_) {
        crudResource = _crudResource_;
      });

      mockResource = mocks.mockResource();

      spyOn(crudResource, 'getResource').and.callFake(mockResource.getResource)
    });


    function spyOnModalConfirm(resolve) {
      spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(resolve));

      function returnPromise(resolve) {
        return function () {
          return makePromise($q, resolve);
        }
      }
    }

    describe('activate with error', function () {
      var scope;
      var vm = {};
      var crudOptions;
      var crudMethods;

      beforeEach(function () {

        inject(function ($rootScope) {
          scope = $rootScope.$new();
        });

        crudMethods = mocks.controllerMethods($q);
        crudOptions = mocks.controllerOptions(scope, {error: 'error'}, crudMethods, {});

        service(vm, crudOptions);
      });

      it('should fail to load', function () {
        // custom matcher
        expect(vm).toFailLoading();
      });
    });

    describe('activated', function () {
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
        crudMethods = mocks.controllerMethods($q);
        crudOptions = mocks.controllerOptions(scope, entities, crudMethods, {});
      });

      describe('initialized', function () {
        beforeEach(function () {
          service(vm, crudOptions);
        });

        it('should support loading', function () {
          // custom matcher
          expect(vm).toSupportLoading();
        });

        it('should support errors', function () {
          expect(vm).toSupportErrors();
        });

        it('should support toastr', function () {
          expect(vm).toSupportToastr();
        });

        it('should support crud', function () {
          expect(vm).toSupportCrud();
        });

        it('should not fail to load', function () {
          expect(vm).not.toFailLoading();
        });

      });


      describe('animate entity', function () {
        beforeEach(function () {
          service(vm, crudOptions);
        });

        it('should not be animating initially', function () {
          expect(vm.entityList.animatingItem(entities[0])).toBeFalsy();
        });

        it('should not be hiding initially', function () {
          expect(vm.entityList.hidingItem(entities[0])).toBeFalsy();
        });


        describe('when close edit form', function () {
          beforeEach(function () {
            service(vm, crudOptions);
            vm.editEntity.show(entities[0]);
            $rootScope.$digest();
            spyOn(entityList, 'hidingEntity');
            spyOn(entityList, 'animatingEntity');

            it('should checked for hidden entity', function() {
              expect(entityList.hidingItem).toHaveBeenCalled();
            });
            
            it('should checked for animating entity', function() {
              expect(entityList.animatingEntity).toHaveBeenCalled();
            });
          });

         });
      });

      describe('clear errors', function () {
        var items = [
          {name: 'edit form'},
          {name: 'new form'}
        ];

        var sampleErrors = {'one': [], 'two': [], 'three': []};
        var existNames = ['one', 'three'];
        var nonExistNames = ['a', 'b'];
        var expected = {'one': null, 'two': [], three: null};

        beforeEach(function () {
          service(vm, crudOptions);
          items[0].object = vm.editEntity;
          items[1].object = vm.newEntity;
        });

        angular.forEach(items, function (item) {
          var object;
          beforeEach(function () {
            object = item.object;
          });
          describe('from ' + item.name, function () {

            describe('when null errors', function () {
              beforeEach(function () {
                object.errors = null;
                object.clearErrors();
              });

              it('should not change errors', function () {
                expect(object.errors).toBeNull();
              });
            });

            describe('when errors exist', function () {
              beforeEach(function () {
                object.errors = angular.copy(sampleErrors);
                object.clearErrors(existNames);
              });

              it('should remove errors', function () {
                expect(object.errors).toEqual(expected);
              });
            });

            describe('when errors don\'t exist', function () {
              beforeEach(function () {
                object.errors = angular.copy(sampleErrors);
                object.clearErrors(nonExistNames);
              });

              it('should not change errors', function () {
                expect(object.errors).toEqual(sampleErrors);
              });
            });
          })
        });

      });
      describe('allow', function () {
        var items = [
          {name: 'edit entity'},
          {name: 'new entity'},
          {name: 'delete entity'}
        ];
        beforeEach(function () {
          service(vm, crudOptions);
          items[0].method = vm.editEntity.allow;
          items[1].method = vm.newEntity.allow;
          items[2].method = vm.entityList.allowDelete;
        });

        angular.forEach(items, function (item) {
          var allow;
          beforeEach(function () {
            allow = item.method;
          });
          describe(item.name, function () {
            it('should not allow when not loggedIn', function () {
              vm.loggedIn = false;
              expect(allow()).toBeFalsy();
            });

            it('should allow when loggedIn', function () {
              vm.loggedIn = true;
              expect(allow()).toBeTruthy();
            });
          })
        });
      });

      describe('forms', function () {
        var editForm;
        var newForm;
        beforeEach(function () {
          service(vm, crudOptions);
          editForm = mocks.mockForm();
          vm.editEntity.form = editForm;
          newForm = mocks.mockForm();
          vm.newEntity.form = newForm;
        });

        describe('edit show', function () {
          beforeEach(function () {
            autoFocus.calls.reset();
            vm.editEntity.show(entities[0]);
            $rootScope.$digest(); // process promise
          });

          it('should be showing form', function () {
            expect(vm.editEntity.showingForm(entities[0])).toBeTruthy();
          });

          it('should set .entity', function () {
            expect(vm.editEntity.entity).toEqual(entities[0]);
          });

          it('should have set focus', function () {
            expect(autoFocus).toHaveBeenCalled();
          });

        });

        describe('edit cancel', function () {
          beforeEach(function () {
            vm.editEntity.show(entities[0]);
            $rootScope.$digest(); // process promise
            spyOn(editForm, '$setPristine').and.callThrough();
            vm.editEntity.cancel();
            $rootScope.$digest();
          });

          it('should not be showing form', function () {
            expect(vm.editEntity.showingForm(entities[0])).toBeFalsy();
          });

          it('should call .$setPristine()', function () {
            expect(editForm.$setPristine).toHaveBeenCalled();
          });

        });

        describe('new show', function () {
          beforeEach(function () {
            autoFocus.calls.reset();
            vm.newEntity.show();
            $rootScope.$digest(); // process promise
          });

          it('should be showing form', function () {
            expect(vm.newEntity.showingForm()).toBeTruthy;
          });

          it('should set .newEntity', function () {
            expect(vm.newEntity.entity).toEqual({});
          });

          it('should have set focus', function () {
            expect(autoFocus).toHaveBeenCalled();
          });
        });

        describe('new hide', function () {
          beforeEach(function () {
            vm.newEntity.show();
            $rootScope.$digest(); // process promise
            spyOn(newForm, '$setPristine').and.callThrough();
            vm.newEntity.cancel();
            $rootScope.$digest();
          });

          it('should not be showing form', function () {
            expect(vm.newEntity.showingForm()).toBeFalsy();
          });

          it('should call $setPristine()', function () {
            expect(newForm.$setPristine).toHaveBeenCalled();
          });
        });

        function checkShowingNewForm(showing) {

          if (showing)
            it('should be showing new form', function () {
              expect(vm.newEntity.showingForm()).toBeTruthy();
            });
          else
            it('should not be showing new form', function () {
              expect(vm.newEntity.showingForm()).toBeFalsy();
            });
        }

        function checkShowingEditForm(showing) {

          if (showing)
            it('should be showing edit form', function () {
              expect(vm.editEntity.showingForm(entities[0])).toBeTruthy();
            });
          else
            it('should not be showing edit form', function () {
              expect(vm.editEntity.showingForm(entities[0])).toBeFalse();
            });
        }

        describe('new form close', function () {
          beforeEach(function () {
            vm.newEntity.show();
            newForm.$pristine = true;
            $rootScope.$digest(); // process promise
          });

          describe('when pristine', function () {
            beforeEach(function () {
              spyOnModalConfirm(true);
            });

            describe('when delete', function () {
              beforeEach(function () {
                vm.entityList.deleteItem(entities[0]);
                $rootScope.$digest(); // process promise
              });

              checkShowingNewForm(false);
            });

            describe('when edit', function () {
              beforeEach(function () {
                vm.editEntity.show(entities[0]);
                $rootScope.$digest(); // process promise
              });

              it('should not have confirmed close', function () {
                expect(modalConfirm.confirm).not.toHaveBeenCalled();
              });

              checkShowingEditForm(true);
            });
          });

          describe('when not pristine resolve', function () {
            beforeEach(function () {
              spyOnModalConfirm(true);
              newForm.$pristine = false;
            });

            describe('when delete', function () {
              beforeEach(function () {
                vm.entityList.deleteItem(entities[0]);
                $rootScope.$digest(); // process promise
              });

              checkShowingNewForm(false);
            });

            describe('when edit', function () {
              beforeEach(function () {
                vm.editEntity.show(entities[0]);
                $rootScope.$digest(); // process promise
              });

              it('should have confirmed close', function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });

              checkShowingEditForm(true);
            });
          });

          describe('when not pristine reject', function () {

            beforeEach(function () {
              spyOnModalConfirm(false);
              newForm.$pristine = false;
              autoFocus.calls.reset();
            });

            describe('when delete', function () {
              beforeEach(function () {
                vm.entityList.deleteItem(entities[0]);
                $rootScope.$digest(); // process promise
              });

              it('should have confirmed close', function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });

              it('should have restored focus', function () {
                expect(autoFocus).toHaveBeenCalled();
              });

              checkShowingNewForm(true);
            });


            describe('when edit', function () {
              beforeEach(function () {
                vm.editEntity.show(entities[0]);
                $rootScope.$digest(); // process promise
              });

              it('should have confirmed close', function () {
                expect(modalConfirm.confirm).toHaveBeenCalled();
              });

              it('should have restored focus', function () {
                expect(autoFocus).toHaveBeenCalled();
              });

              checkShowingNewForm(true);
            });
          });
        });


        describe('edit close', function () {
          beforeEach(function () {
            vm.editEntity.show(entities[0]);
            editForm.$pristine = true;
            $rootScope.$digest(); // process promise
          });

          describe('pristine', function () {
            beforeEach(function () {
              spyOnModalConfirm(true);
              vm.newEntity.show();
              $rootScope.$digest(); // process promise
            });

            it('should not have confirmed close', function () {
              expect(modalConfirm.confirm).not.toHaveBeenCalled();
            });

            checkShowingNewForm(true);
          });

          describe('not pristine resolve', function () {
            beforeEach(function () {
              spyOnModalConfirm(true);
              editForm.$pristine = false;
              vm.newEntity.show();
              $rootScope.$digest(); // process promise
            });

            it('should have confirmed close', function () {
              expect(modalConfirm.confirm).toHaveBeenCalled();
            });

            checkShowingNewForm(true);

          });

          describe('not pristine reject', function () {
            beforeEach(function () {
              spyOnModalConfirm(false);
              editForm.$pristine = false;
              autoFocus.calls.reset();
              vm.newEntity.show();
              $rootScope.$digest(); // process promise
            });

            it('should have confirmed close', function () {
              expect(modalConfirm.confirm).toHaveBeenCalled();
            });

            checkShowingEditForm(true);

            it('should have restored focus', function () {
              expect(autoFocus).toHaveBeenCalled();
            });
          });
        });
      });

      describe('crud create success', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          spyOn(crudMethods, 'prepareToCreateEntityImpl').and.callThrough();
          vm.newEntity.entity = {name: 'four'};
          vm.newEntity.submit();
          $rootScope.$digest();
        });

        it('should insert entity', function () {
          expect(entities.length).toEqual(originalEntities.length + 1);
          expect(entities[1]).toEqual(originalEntities[0]);
        });

        it('should have called prepareToCreateEntity()', function () {
          expect(crudMethods.prepareToCreateEntityImpl).toHaveBeenCalled();
        });

        it('should not have .newEntity.errors', function () {
          expect(vm.newEntity.errors).toBe(null);
        });

      });

      describe('crud create error', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          mockResource.respondWithError = true;
          vm.newEntity.entity = {name: 'four'};
          vm.newEntity.submit();
        });

        it('should not change entities', function () {
          expect(entities.length).toEqual(originalEntities.length);
        });

        it('should have .newEntity.errors', function () {
          expect(vm.newEntity.errors).not.toBe(null);
        });

      });

      describe('crud update success', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          spyOn(crudMethods, 'prepareToUpdateEntityImpl').and.callThrough();
          vm.editEntity.entity = angular.copy(entities[2]);
          vm.editEntity.entity.name = 'xyz';
          vm.editEntity.submit();
          $rootScope.$digest();
        });

        it('should have updated entity', function () {
          expect(entities[2].name).toEqual('xyz');
        });

        it('should have called .prepareToUpdateEntity()', function () {
          expect(crudMethods.prepareToUpdateEntityImpl).toHaveBeenCalled();
        });

        it('should not have entityUpdateErrors', function () {
          expect(vm.editEntity.errors).toBe(null);
        });

      });

      describe('crud update error', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          mockResource.respondWithError = true;
          vm.editEntity.entity = angular.copy(entities[2]);
          vm.editEntity.entity.name = 'xyz';
          vm.editEntity.submit();
        });

        it('should not change entities', function () {
          expect(entities).toEqual(originalEntities);
        });

        it('should have .editEntity.errors', function () {
          expect(vm.editEntity.errors).not.toBe(null);
        });

      });

      describe('crud delete success', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          vm.entityList.deleteItem(entities[2], false);
          $rootScope.$digest();
        });

        it('should change entities', function () {
          expect(entities.length).toEqual(originalEntities.length - 1);
          expect(entities[2]).toEqual(originalEntities[3]);
        });

        it('should not have toast', function () {
          expect(vm).not.toHaveToast();
        });

      });

      describe('crud delete error', function () {
        var message;
        beforeEach(function () {
          service(vm, crudOptions);
          mockResource.respondWithError = true;
          var fn = vm.showToast;
          vm.showToast = function (_message_) {
            message = _message_;
            fn(_message_);
          };
          vm.entityList.deleteItem(entities[2], false);
          $rootScope.$digest();
        });

        it('should not change entities', function () {
          expect(entities).toEqual(originalEntities);
        });

        it('should have called .showToastrError() with error message', function () {
          expect(message).toBe(mockResource.firstErrorPrefix + ' ' + mockResource.firstErrorValue);
        });

        it('should have toast', function () {
          expect(vm).toHaveToast();
        });

      });

      describe('confirm delete', function () {
        beforeEach(function () {
          service(vm, crudOptions);
        });

        describe('open modal', function () {
          beforeEach(function () {
            spyOn(crudMethods, 'getEntityDisplayNameImpl').and.callThrough();
            spyOn(modalConfirm, 'confirm').and.callThrough();
            vm.entityList.deleteItem(entities[2]);
            $rootScope.$digest();
          });

          it('should call .getEntityDisplayName()', function () {
            expect(crudMethods.getEntityDisplayNameImpl).toHaveBeenCalled();
          });

          it('should call .confirm()', function () {
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });
        });

        describe('confirm delete', function () {
          beforeEach(function () {
            spyOnModalConfirm(true);
            vm.entityList.deleteItem(entities[2], true);
            $rootScope.$digest(); // process promise
          });

          it('should call .confirm()', function () {
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });

          it('should change entities', function () {
            expect(entities).not.toEqual(originalEntities);
          });
        });

        describe('confirm cancel', function () {
          beforeEach(function () {
            spyOnModalConfirm(false);
            vm.entityList.deleteItem(entities[2], true);
            $rootScope.$digest(); // process promise
          });

          it('should call .confirm()', function () {
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });

          it('should not change entities', function () {
            expect(entities).toEqual(originalEntities);
          });
        });
      });
    });
  });

  function mockFactories() {

    return {
      controllerOptions: controllerOptions,
      controllerMethods: function ($q) {
        return new ControllerMethods($q)
      },
      mockResource: function () {
        return new MockResource();
      },
      mockForm: function () {
        return new MockForm();
      }
    };

    function controllerOptions(scope, response, methods, errorsMap) {
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
        errorsMap: errorsMap
      };
      return options;
    }


    function ControllerMethods(_$q_) {

      var _this = this;
      var $q = _$q_;

      this.makeEntityBody = function (entity) {
        return entity;
      };

      this.getEntityDisplayName = function (entity) {
        return _this.getEntityDisplayNameImpl(entity);
      };

      // can spyOn
      this.getEntityDisplayNameImpl = function (entity) {
        return entity.name;
      };

      this.beforeShowNewEntity = function () {
        return makePromise($q, true);
      };

      this.beforeShowEditEntity = function () {
        return makePromise($q, true);
      };

      this.prepareToCreateEntity = function (entity) {
        return _this.prepareToCreateEntityImpl(entity);
      };

      // Can spyOn
      this.prepareToCreateEntityImpl = function (entity) {
        return entity;
      };

      this.prepareToUpdateEntity = function (entity) {
        return _this.prepareToUpdateEntityImpl(entity);
      };

      // Can spyOn
      this.prepareToUpdateEntityImpl = function (entity) {
        return entity;
      };
    }

    function MockForm() {

      this.$setPristine = function () {

      }
    }

    function MockResource() {

      var _this = this;

      this.respondWithError = false;

      this.getResource = function () {
        var methods;

        if (!_this.respondWithError)
          methods = {
            save: saveResource,
            remove: removeResource,
            update: updateResource
          };
        else
          methods = {
            save: saveResourceError,
            remove: removeResourceError,
            update: updateResourceError
          };

        return methods;

      };

      var firstErrorKey = 'an_error';
      this.firstErrorValue = 'blah blah';
      this.firstErrorPrefix = 'An error';

      this.errors = {data: {}};
      this.errors.data[firstErrorKey] = this.firstErrorValue;
      this.errors.data['another'] = 'another error';

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

  /*global MatcherHelper*/
  beforeEach(function () {
    var matchers = {
      // Validate parameter to crudHelper service
      // Usage: expect(options).toBeCrudOptions();
      toBeCrudOptions: function () {
        return {
          compare: compare
        };
        function compare(options) {
          var helper = new MatcherHelper(options);
          helper.checkFunction('prepareToCreateEntity');
          helper.checkFunction('prepareToUpdateEntity');
          helper.checkFunction('beforeShowNewEntity');
          helper.checkFunction('beforeShowEditEntity');
          helper.checkFunction('getEntityDisplayName');
          helper.checkFunction('makeEntityBody');
          helper.checkObject('errorsMap');
          helper.checkObject('scope');
          helper.checkString('resourceName');
          helper.checkString('entityKind');

          return helper.getResult();
        }
      },
      // Validate crud members
      // Usage: expect(vm).supportsCrud();
      toSupportCrud: function () {
        return {
          compare: compare
        };
        function compare(vm) {
          var helper = new MatcherHelper(vm);

          helper.checkFunction('beginWait');
          helper.checkObject('newEntity');
          helper.checkObject('editEntity');
          helper.checkObject('entityList');

          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });

  function makePromise($q, resolve) {
    if (resolve)
      return $q.when(0);
    else
      return $q.reject();
  }
})
();

