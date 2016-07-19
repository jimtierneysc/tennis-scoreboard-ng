(function () {
  'use strict';

  describe('crudHelper service', function () {

    var mocks;
    var service;
    var mockResource;


    beforeEach(module('frontend'));

    beforeEach(function () {

      inject(function (_crudHelper_) {
        service = _crudHelper_;
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
        crudMethods = mocks.controllerMethods();
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

      describe('form', function () {
        var editForm;
        var newForm;
        beforeEach(function () {
          service(vm, crudOptions);
          editForm = mocks.mockForm();
          vm.editEntityForm = editForm;
          newForm = mocks.mockForm();
          vm.newEntityForm = newForm;
        });

        describe('edit show', function () {
          beforeEach(function () {
            vm.showEditEntity(entities[0]);
          });

          it('should be .showingEditEntity()', function () {
            expect(vm.showingEditEntity(entities[0])).toBeTruthy();
          });

          it('should set .editEntity', function () {
            expect(vm.editEntity).toEqual(entities[0]);
          });
        });

        describe('edit hide', function () {
          beforeEach(function () {
            vm.showEditEntity(entities[0]);
            spyOn(editForm, '$setPristine').and.callThrough();
            vm.hideEditEntity();
          });

          it('should be .showingEditEntity()', function () {
            expect(vm.showingEditEntity(entities[0])).toBeFalsey;
          });

          it('should call .$setPristine()', function () {
            expect(editForm.$setPristine).toHaveBeenCalled();
          });
        });

        describe('new show', function () {
          beforeEach(function () {
            vm.showNewEntity();
          });

          it('should be .showingNewEntity()', function () {
            expect(vm.showingNewEntity).toBeTruthy;
          });

          it('should set .newEntity', function () {
            expect(vm.newEntity).toEqual({});
          });
        });

        describe('new hide', function () {
          beforeEach(function () {
            vm.showNewEntity();
            spyOn(newForm, '$setPristine').and.callThrough();
            vm.hideNewEntity();
          });

          it('should not be .showingNewEntity', function () {
            expect(vm.showingNewEntity).toBeFalsy();
          });

          it('should call $setPristine()', function () {
            expect(newForm.$setPristine).toHaveBeenCalled();
          });
        });
      });

      function expectWaitIndicator() {
        it('should call .beginWait()', function () {
          expect(waitIndicator.beginWait).toHaveBeenCalled();
        });

        it('should not be .waiting when finished', function () {
          expect(waitIndicator.waiting()).toBeFalsy();
        });
      }

      describe('crud create success', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          spyOn(crudMethods, 'prepareToCreateEntityImpl').and.callThrough();
          vm.newEntity = {name: 'four'};
          vm.submitNewEntity();
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

        expectWaitIndicator();
      });

      describe('crud create error', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          mockResource.respondWithError = true;
          vm.newEntity = {name: 'four'};
          vm.submitNewEntity();
        });

        it('should not change entities', function () {
          expect(entities.length).toEqual(originalEntities.length);
        });

        it('should have .entityCreateErrors', function () {
          expect(vm.entityCreateErrors).not.toBe(null);
        });

        expectWaitIndicator();
      });

      describe('crud update success', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          spyOn(crudMethods, 'prepareToUpdateEntityImpl').and.callThrough();
          vm.editEntity = angular.copy(entities[2]);
          vm.editEntity.name = 'xyz'
          vm.submitEditEntity();
        });

        it('should have updated entity', function () {
          expect(entities[2].name).toEqual('xyz');
        });

        it('should have called .prepareToUpdateEntity()', function () {
          expect(crudMethods.prepareToUpdateEntityImpl).toHaveBeenCalled();
        });

        it('should not have entityUpdateErrors', function () {
          expect(vm.entityUpdateErrors).toBe(null);
        });

        expectWaitIndicator();
      });

      describe('crud update error', function () {
        beforeEach(function () {
          service(vm, crudOptions);
          mockResource.respondWithError = true;
          vm.editEntity = angular.copy(entities[2]);
          vm.editEntity.name = 'xyz'
          vm.submitEditEntity();
        });

        it('should not change entities', function () {
          expect(entities).toEqual(originalEntities);
        });

        it('should have .entityUpdateErrors', function () {
          expect(vm.entityUpdateErrors).not.toBe(null);
        });

        expectWaitIndicator();
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

        expectWaitIndicator();
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

        expectWaitIndicator();
      });

      describe('confirm delete', function () {
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

          it('should call .getEntityDisplayName()', function () {
            expect(crudMethods.getEntityDisplayNameImpl).toHaveBeenCalled();
          });

          it('should call .confirm()', function () {
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

          it('should call .confirm()', function () {
            expect(modalConfirm.confirm).toHaveBeenCalled();
          });

          it('should change entities', function () {
            expect(entities).not.toEqual(originalEntities);
          });
        });

        describe('confirm cancel', function () {
          beforeEach(function () {
            spyOn(modalConfirm, 'confirm').and.callFake(returnPromise(false));
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
      controllerMethods: function () {
        return new ControllerMethods()
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

      _this.$setPristine = function () {

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

      var firstErrorKey = 'an_error'
      _this.firstErrorValue = 'blah blah';
      _this.firstErrorPrefix = 'An error';

      _this.errors = { data: {}};
      _this.errors.data[firstErrorKey] = _this.firstErrorValue;
      _this.errors.data['another'] = 'another error';

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
      // toBeCrudOptions matcher
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
          helper.checkFunction('beforeShowNewEntity', false);
          helper.checkFunction('beforeShowEditEntity', false);
          helper.checkFunction('getEntityDisplayName');
          helper.checkFunction('makeEntityBody');
          helper.checkObject('errorsMap');
          helper.checkObject('scope');
          helper.checkString('resourceName');

          return helper.getResult();
        }
      },
      // toSupportCrud matcher
      // Validate crued members
      // Usage: expect(vm).supportsCrud();
      toSupportCrud: function () {
        return {
          compare: compare
        };
        function compare(vm) {
          var helper = new MatcherHelper(vm);

          helper.checkFunction('trashEntity');
          helper.checkFunction('submitNewEntity');
          helper.checkFunction('showNewEntity');
          helper.checkFunction('hideNewEntity');
          helper.checkFunction('submitEditEntity');
          helper.checkFunction('showEditEntity');
          helper.checkFunction('hideEditEntity');
          helper.checkFunction('showingEditEntity');
          helper.checkFunction('beginWait');
          helper.checkBoolean('showingNewEntity');
          helper.checkObject('newEntity');
          helper.checkObject('editEntity', false);
          helper.checkObject('newEntityForm', false);
          helper.checkObject('editEntityForm', false);
          helper.checkObject('entityCreateErrors', false);
          helper.checkObject('entityUpdateErrors', false);

          return helper.getResult();
        }
      }
    };

    jasmine.addMatchers(matchers);
  });
})
();

