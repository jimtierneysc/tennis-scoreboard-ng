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
    .module('frontendHelpers')
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

      vm.newEntity = null;
      vm.editEntity = null;
      vm.showingNewEntity = false;
      vm.newEntityForm = null;
      vm.editEntityForm = null;
      vm.entitys = [];
      vm.entityCreateErrors = null;
      vm.entityUpdateErrors = null;

      // Allow new and edit operations to be cancelled
      editInProgress.registerOnQueryState(scope, operations.getEditorState);
      editInProgress.registerOnClose(scope, operations.closeEditors);

      if (angular.isArray(response))
        operations.entityLoadingHasCompleted(response);
      else
        operations.entityLoadHasFailed(response);
    }

    function Operations(_vm_, controllerOptions) {
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
      var scope = controllerOptions.scope;

      var CRUD = 'crud';
      var REFOCUS = 'refocus';

      this.getEditorState = function (event, data) {
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
        data.name = CRUD;
        if (editing) {
          data.labels.text = message;
          data.labels.title = 'Confirm Discard Edits';
          data.pristine = false;
          data.autoFocus = REFOCUS;
          data.autoFocusScope = scope;
        }

      };

      this.closeEditors = function (event, state) {
        if (state.name == CRUD) {
          hideNewEntity();
          hideEditEntity();
        }
      };

      this.trashEntity = function (entity, confirmDelete) {
        vm.clearToast();
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

      this.submitNewEntity = function () {
        var submitEntity = prepareToCreateEntity(vm.newEntity);
        createEntity(submitEntity);
      };

      this.showNewEntity = function () {

        vm.clearToast();

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          vm.newEntity = {};
          beforeShowNewEntity().then(showEntity);

          function showEntity() {
            vm.showingNewEntity = true;
            // new entity form should have an element with the following attribute.
            // fe-auto-focus='refocus'
            autoFocus(scope, REFOCUS);
          }
        }
      };

      this.hideNewEntity = hideNewEntity;

      this.submitEditEntity = function () {
        var submit = prepareToUpdateEntity(vm.editEntity);
        updateEntity(submit);
      };

      this.showEditEntity = function (entity) {

        vm.clearToast();

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          // Edit a copy, so can discard unless click Save
          vm.editEntity = angular.copy(entity);
          beforeShowEditEntity().then(showEntity);

          function showEntity() {
            // new entity form should have an element with the following attribute.
            // fe-auto-focus='refocus'
            autoFocus(scope, REFOCUS);
          }
        }
      };

      this.hideEditEntity = hideEditEntity;

      this.showingEditEntity = function (entity) {
        return vm.editEntity && (vm.editEntity.id == entity.id);
      };

      this.entityLoadingHasCompleted = function (response) {
        vm.entitys = response;
        vm.loadingHasCompleted();
      };

      this.entityLoadHasFailed = function (response) {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loadingHasFailed(response);
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
        getResource().save(body,
          function (response) {
            var newEntity = angular.copy(entity);
            angular.merge(newEntity, response);
            entityCreated(newEntity);
          },
          function (response) {
            $log.error('create error ' + response.status + " " + response.statusText);
            entityCreateError(entity, response);
          }
        );
      }

      function updateEntity(entity) {
        var id = entity.id;
        var key = {id: id};
        var body = makeEntityBody(entity);
        getResource().update(key, body,
          function (response) {
            var updatedEntity = angular.copy(entity);
            angular.merge(updatedEntity, response);
            entityUpdated(updatedEntity);
          },
          function (response) {
            $log.error('update error ' + response.status + " " + response.statusText);
            entityUpdateError(entity, response);
          }
        );
      }

      function removeEntity(entity) {
        var id = entity.id;
        var key = {id: id};
        getResource().remove(key,
          function () {
            entityRemoved(entity);
          },
          function (response) {
            $log.error('remove entity error ' + response.status + " " + response.statusText);
            entityRemoveError(entity, response);
          }
        );
      }

      function entityCreated(entity) {
        hideNewEntity();
        vm.entitys.splice(0, 0, entity);
        vm.entityCreateErrors = null;
      }

      function entityUpdated(entity) {
        hideEditEntity();
        var id = entity.id;
        var found = $filter('filter')(vm.entitys, function (o) {
          return o.id === id;
        });
        if (found && found.length === 1) {
          angular.copy(entity, found[0]);
        }
      }

      function entityCreateError(entity, response) {
        vm.showHttpErrorToast(response.status);
        vm.entityCreateErrors = vm.errorsOfResponse(response);
      }

      function entityUpdateError(entity, response) {
        vm.showHttpErrorToast(response.status);
        vm.entityUpdateErrors = vm.errorsOfResponse(response);
      }

      function entityRemoved(entity) {
        vm.entityRemoveErrors = null;
        var i = vm.entitys.indexOf(entity);
        if (i >= 0) {
          vm.entitys.splice(i, 1);
        }
      }

      function entityRemoveError(entity, response) {
        if (!vm.showHttpErrorToast(response.status)) {
          showErrorToast()
        }

        function showErrorToast() {
          var message = "";
          var errors = vm.errorsOfResponse(response);
          if (errors && errors.other && errors.other[0])
            message = errors.other[0];
          vm.showToast(message, "Unable to Delete");
        }
      }
    }
  }
})();




