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

          it('should not be .hidingEntity()', function () {
            expect(vm.hidingEntity(entities[0])).toBeFalsy();
          });

          it('should set .editEntity', function () {
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

          it('should not be .hidingEntity()', function () {
            expect(vm.hidingEntity(entities[0])).toBeFalsey;
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

          it('should be .showingNewEntity', function () {
            expect(vm.showingNewEntity).toBeTruthy;
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

          it('should not be .showingNewEntity', function () {
            expect(vm.showingNewEntity).toBeFalsy();
          });

          it('should call $setPristine()', function () {
            expect(newForm.$setPristine).toHaveBeenCalled();
          });
        });

        function checkShowingNewForm() {

          it('should be .showingNewEntity', function () {
            expect(vm.showingNewEntity).toBeTruthy();
          });

          it('should not be .hidingEntity()', function () {
            expect(vm.hidingEntity(entities[0])).toBeFalsy();
          });
        }

        function checkShowingEditForm() {

          it('should not be .showingNewEntity', function () {
            expect(vm.showingNewEntity).toBeFalsy();
          });

          it('should not be .hidingEntity()', function () {
            expect(vm.hidingEntity(entities[0])).toBeFalsy();
          });
        }

        describe('new close', function () {
          beforeEach(function () {
            vm.newEntity.show();
            newForm.$pristine = true;
            $rootScope.$digest(); // process promise
          });

          describe('pristine', function () {
            beforeEach(function () {
              spyOnModalConfirm(true);
              vm.editEntity.show(entities[0]);
              $rootScope.$digest(); // process promise
            });

            it('should not have confirmed close', function () {
              expect(modalConfirm.confirm).not.toHaveBeenCalled();
            });

            checkShowingEditForm();
          });

          describe('not pristine resolve', function () {
            beforeEach(function () {
              spyOnModalConfirm(true);
              newForm.$pristine = false;
              vm.editEntity.show(entities[0]);
              $rootScope.$digest(); // process promise
            });

            it('should have confirmed close', function () {
              expect(modalConfirm.confirm).toHaveBeenCalled();
            });

            checkShowingEditForm();
          });

          describe('not pristine reject', function () {
            beforeEach(function () {
              spyOnModalConfirm(false);
              newForm.$pristine = false;
              autoFocus.calls.reset();
              vm.editEntity.show(entities[0]);
              $rootScope.$digest(); // process promise
            });

            it('should have confirmed close', function () {
              expect(modalConfirm.confirm).toHaveBeenCalled();
            });

            it('should have restored focus', function () {
              expect(autoFocus).toHaveBeenCalled();
            });

            checkShowingNewForm();
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

            checkShowingNewForm();
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

            checkShowingNewForm();

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

            checkShowingEditForm();

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

        it('should not have .entityCreateErrors', function () {
          expect(vm.entityCreateErrors).toBe(null);
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

        it('should have .entityCreateErrors', function () {
          expect(vm.entityCreateErrors).not.toBe(null);
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
          vm.trashEntity(entities[2], false);
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
          vm.trashEntity(entities[2], false);
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

        // expectWaitIndicator();
      });

      describe('confirm delete', function () {
        beforeEach(function () {
          service(vm, crudOptions);
        });

        describe('open modal', function () {
          beforeEach(function () {
            spyOn(crudMethods, 'getEntityDisplayNameImpl').and.callThrough();
            spyOn(modalConfirm, 'confirm').and.callThrough();
            vm.trashEntity(entities[2]);
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
            vm.trashEntity(entities[2], true);
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
            vm.trashEntity(entities[2], true);
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

          helper.checkFunction('trashEntity');
          // helper.checkFunction('submitNewEntity');
          // helper.checkFunction('showNewEntity');
          // helper.checkFunction('cancelNewEntity');
          // helper.checkFunction('submitEditEntity');
          // helper.checkFunction('showEditEntity');
          // helper.checkFunction('cancelEditEntity');
          // helper.checkFunction('hidingEntity');
          helper.checkFunction('beginWait');
          helper.checkBoolean('showingNewEntity');
          helper.checkObject('newEntity');
          helper.checkObject('editEntity');
          // helper.checkObject('editEntity', false);
          // helper.checkObject('newEntityForm', false);
          // helper.checkObject('editEntityForm', false);
          // helper.checkObject('entityCreateErrors', false);
          // helper.checkObject('entityUpdateErrors', false);

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

