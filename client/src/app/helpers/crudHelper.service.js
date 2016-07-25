/**
 * @ngdoc factory
 * @name crudHelper
 * @description
 * Add CRUD functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('frontend-helpers')
    .factory('crudHelper', factory);

  /** @ngInject */
  function factory($log, modalConfirm,
                   $filter, loadingHelper, errorsHelper, toastrHelper,
                   waitIndicator, crudResource, editInProgress, autoFocus) {
    return activate;

    function activate(vm, options) {
      var response = options.response;
      var errorsMap = options.errorsMap;
      var scope = options.scope;

      // Aggregate functionality from other helpers
      loadingHelper(vm);
      toastrHelper(vm, scope);
      errorsHelper(vm, errorsMap);

      var operations = new Operations(vm, options);

      // Set crud methods and properties
      vm.trashEntity = operations.trashEntity;
      vm.submitNewEntity = operations.submitNewEntity;
      vm.showNewEntity = operations.showNewEntity;
      vm.hideNewEntity = operations.hideNewEntity;
      vm.submitEditEntity = operations.submitEditEntity;
      vm.showEditEntity = operations.showEditEntity;
      vm.hideEditEntity = operations.hideEditEntity;
      vm.showingEditEntity = operations.showingEditEntity;
      vm.beginWait = waitIndicator.beginWait;

      vm.newEntity =  null;
      vm.editEntity = null;
      vm.showingNewEntity = false;
      vm.newEntityForm = null;
      vm.editEntityForm = null;
      vm.entitys = [];
      vm.entityCreateErrors = null;
      vm.entityUpdateErrors = null;

      // Allow new and edit operations to be cancelled
      editInProgress.registerOnQueryState(scope, operations.editorState);
      editInProgress.registerOnClose(scope, operations.closeEditors);

      if (angular.isArray(response))
        operations.entityLoaded(response);
      else
        operations.entityLoadFailed(response);
    }

    function Operations(_vm_, controllerOptions) {
      var _this = this;
      var vm = _vm_;
      var getResource = function () {
        return crudResource.getResource(controllerOptions.resourceName)
      };
      var prepareToCreateEntity = controllerOptions.prepareToCreateEntity;
      var prepareToUpdateEntity = controllerOptions.prepareToUpdateEntity;
      var beforeShowNewEntity = controllerOptions.beforeShowNewEntity;
      var beforeShowEditEntity = controllerOptions.beforeShowEditEntity;
      var getEntityDisplayName = controllerOptions.getEntityDisplayName;
      var makeEntityBody = controllerOptions.makeEntityBody;
      var entityKind = controllerOptions.entityKind;

      var CRUD = 'crud';
      var REFOCUS = 'refocus';

      _this.editorState = function (event, data) {
        var editing = false;
        var message;
        if (vm.editEntity && vm.editEntityForm && !vm.editEntityForm.$pristine) {
          editing = true;
          message = 'You have unsaved edits of ' + getEntityDisplayName(vm.editEntity) +
            '. Do you want to discard your edits?';
        } else if (vm.newEntity && vm.newEntityForm && !vm.newEntityForm.$pristine) {
          editing = true;
          message = 'You are adding a new ' + entityKind +
            '. Do you want to discard your input?';
        }
        if (editing) {
          data.labels.text = message;
          data.labels.title = 'Confirm Discard Edits';
          data.pristine = false;
          data.autoFocus = REFOCUS;
          data.name = CRUD;
        }

       };

      _this.closeEditors = function (state) {
        if (state.name == CRUD) {
          hideNewEntity();
          hideEditEntity();
        }
      };

      _this.trashEntity = function (entity, confirmDelete) {
        if (angular.isUndefined(confirmDelete))
          confirmDelete = true;
        if (confirmDelete) {
          modalConfirm.confirm({
            title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
            getEntityDisplayName(entity) + '"?'
          })
            .then(function () {
              removeEntity(entity)
            });
        }
        else {
          removeEntity(entity)
        }
      };

      _this.submitNewEntity = function () {
        var submitEntity = prepareToCreateEntity(vm.newEntity);
        createEntity(submitEntity);
      };

      _this.showNewEntity = function () {

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          vm.newEntity = {};
          if (beforeShowNewEntity)
            beforeShowNewEntity().then(
              showEntity,
              function () {
                // Do nothing when rejected
              });
          else
            showEntity();

          function showEntity() {
            vm.showingNewEntity = true;
            // new entity form should have an element with the following attribute.
            // fe-auto-focus='refocus'
            autoFocus(REFOCUS);
          }
        }
      };

      _this.hideNewEntity = function () {
        if (vm.newEntityForm) {
          vm.newEntityForm.$setPristine();
        }
        vm.showingNewEntity = false;
        vm.newEntity = null;
        vm.entityCreateErrors = null;
      };

      _this.submitEditEntity = function () {
        var submit = prepareToUpdateEntity(vm.editEntity);
        updateEntity(submit);
      };

      _this.showEditEntity = function (entity) {

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          // Edit a copy, so can discard unless click Save
          vm.editEntity = angular.copy(entity);
          if (beforeShowEditEntity)
            beforeShowEditEntity();
          // new entity form should have an element with the following attribute.
          // fe-auto-focus='refocus'
          autoFocus(REFOCUS);
        }
      };

      _this.hideEditEntity = hideEditEntity;

      _this.showingEditEntity = function (entity) {
        return vm.editEntity && (vm.editEntity.id == entity.id);
      };

      _this.entityLoaded = function (response) {
        vm.entitys = response;
        vm.updateLoadingCompleted();
      };

      _this.entityLoadFailed = function (response) {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.updateLoadingFailed(response);
      };

      //
      // Internal methods
      //

      function hideNewEntity() {
        if (vm.newEntityForm) {
          vm.newEntityForm.$setPristine();
        }
        vm.showingNewEntity = false;
        vm.newEntity = null;
        vm.entityCreateErrors = null;
      }

      function hideEditEntity() {
        if (vm.editEntityForm) {
          vm.editEntityForm.$setPristine();
        }
        vm.editEntity = null;
        vm.entityUpdateErrors = null;
      }

      function createEntity(entity) {
        var body = makeEntityBody(entity);
        var endWait = vm.beginWait();
        getResource().save(body,
          function (response) {
            endWait();
            var newEntity = angular.copy(entity);
            angular.merge(newEntity, response);
            entityCreated(newEntity);
          },
          function (response) {
            $log.error('create error ' + response.status + " " + response.statusText);
            endWait();
            entityCreateError(entity, response);
          }
        );
      }

      function updateEntity(entity) {
        var id = entity.id;
        var key = {id: id};
        var body = makeEntityBody(entity);
        var endWait = vm.beginWait();
        getResource().update(key, body,
          function (response) {
            endWait();
            var updatedEntity = angular.copy(entity);
            angular.merge(updatedEntity, response);
            entityUpdated(updatedEntity);
          },
          function (response) {
            $log.error('update error ' + response.status + " " + response.statusText);
            endWait();
            entityUpdateError(entity, response);
          }
        );
      }

      function removeEntity(entity) {
        var id = entity.id;
        var key = {id: id};
        var endWait = vm.beginWait();
        getResource().remove(key,
          function () {
            endWait();
            entityRemoved(entity);
          },
          function (response) {
            $log.error('remove entity error ' + response.status + " " + response.statusText);
            endWait();
            entityRemoveError(entity, response);
          }
        );
      }

      function entityCreated(entity) {
        _this.hideNewEntity();
        vm.entitys.splice(0, 0, entity);
        vm.entityCreateErrors = null;
      }

      function entityUpdated(entity) {
        _this.hideEditEntity();
        var id = entity.id;
        var found = $filter('filter')(vm.entitys, function (o) {
          return o.id === id;
        });
        if (found && found.length === 1) {
          angular.copy(entity, found[0]);
        }
      }

      function entityCreateError(entity, response) {
        var errors = vm.errorsOfResponse(response);
        vm.entityCreateErrors = errors;
      }

      function entityUpdateError(entity, response) {
        var errors = vm.errorsOfResponse(response);
        vm.entityUpdateErrors = errors;
      }

      function entityRemoved(entity) {
        vm.entityRemoveErrors = null;
        var i = vm.entitys.indexOf(entity);
        if (i >= 0) {
          vm.entitys.splice(i, 1);
        }
      }

      function entityRemoveError(entity, response) {
        var message = "";
        if (angular.isObject(response.data)) {
          var errors = vm.errorsOfResponse(response);
          if (angular.isDefined(errors.other[0]))
            message = errors.other[0];
        }
        vm.showToast(message, "Unable to Delete");
      }
    }
  }
})();




