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
    .module('frontendCrud')
    .factory('crudHelper', factory);

  /** @ngInject */
  function factory($log, modalConfirm, $timeout, $q,
                   $filter, loadingHelper, errorsHelper, toastrHelper,
                   waitIndicator, crudResource, editInProgress, autoFocus, animationTimers) {
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
      vm.hidingEntity = operations.hidingEntity;
      vm.animatingEntity = operations.animatingEntity;
      vm.beginWait = waitIndicator.beginWait;

      vm.editEntity = {
          form: null,
          errors: null,
          cancel: operations.cancelEditEntity,
          submit: operations.submitEditEntity,
          ok: 'Save',
          entity: null,
          show: operations.showEditEntity,
          showingForm: operations.showingEditEntityForm
      };
      
      vm.newEntity = {
          form: null,
          errors: null,
          cancel: operations.cancelNewEntity,
          submit: operations.submitNewEntity,
          ok: 'Add',
          entity: null,
          show: operations.showNewEntity,
          showingForm: operations.showingNewEntityForm
      };
      vm.showingNewEntity = false;
      vm.entitys = [];

      // Allow new and edit operations to be cancelled
      editInProgress.registerOnQueryState(scope, operations.getEditorState);
      editInProgress.registerOnClose(scope, operations.closeEditors);

      if (angular.isArray(response))
        operations.entityLoadingHasCompleted(response);
      else
        operations.entityLoadHasFailed(response);
    }

    function Operations(vm, options) {
      var getResource = function () {
        return crudResource.getResource(options.resourceName)
      };

      var CRUD = 'crud';
      var REFOCUS = 'refocus';

      // Flags used to animate forms
      var hideEditForm = false;
      var hideNewForm = false;
      var hiddenEntity = null;
      var animatedEntity = null;

      // Provide information used to cancel editing
      this.getEditorState = function (event, data) {
        var editing = false;
        var message;
        if (vm.editEntity.entity && vm.editEntity.form && !vm.editEntity.form.$pristine) {
          editing = true;
          message = 'You have unsaved edits of ' + options.getEntityDisplayName(vm.editEntity.entity) +
            '. Do you want to discard your edits?';
        } else if (vm.newEntity.entity && vm.newEntity.form && !vm.newEntity.form.$pristine) {
          editing = true;
          message = 'You are adding a new ' + options.entityKind +
            '. Do you want to discard your input?';
        }
        data.name = CRUD;
        if (editing) {
          data.labels.text = message;
          data.labels.title = 'Confirm Discard Edits';
          data.pristine = false;
          data.autoFocus = REFOCUS;
          data.autoFocusScope = options.scope;
        }

      };

      // Method to close editors.  May be called to close new form when edit button is clicked.
      // May also be called when leaving view.
      this.closeEditors = function (event, state, defer) {
        if (state.name == CRUD) {
          // add promises to array parameter
          defer.push(resetNewEntity(), resetEditEntity());
        }
      };

      //
      // Methods called from view
      //
      this.trashEntity = function (entity, confirmDelete) {
        vm.clearToast();
        if (angular.isUndefined(confirmDelete))
          confirmDelete = true;
        if (confirmDelete) {
          modalConfirm.confirm({
            title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
            options.getEntityDisplayName(entity) + '"?'
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
        var submitEntity = options.prepareToCreateEntity(vm.newEntity.entity);
        createEntity(submitEntity);
      };

      this.showNewEntity = function () {

        vm.clearToast();

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          hideNewForm = false;
          vm.newEntity.entity = {};
          options.beforeShowNewEntity().then(showEntity);

          function showEntity() {
            vm.showingNewEntity = true;
            // new entity form should have an element with the following attribute.
            // fe-auto-focus='refocus'
            autoFocus(options.scope, REFOCUS);
          }
        }
      };

      this.cancelNewEntity = resetNewEntity;

      this.submitEditEntity = function () {
        var submit = options.prepareToUpdateEntity(vm.editEntity.entity);
        updateEntity(submit);
      };

      this.showEditEntity = function (entity) {

        vm.clearToast();

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          hideEditForm = false;
          // Edit a copy, so can discard unless click Save
          vm.editEntity.entity = angular.copy(entity);
          options.beforeShowEditEntity().then(showEntity);

          function showEntity() {
            // new entity form should have an element with the following attribute.
            // fe-auto-focus='refocus'
            autoFocus(options.scope, REFOCUS);
          }
        }
      };

      this.cancelEditEntity = resetEditEntity;

      function editingEntity(entity) {
        return vm.editEntity.entity && (vm.editEntity.entity.id == entity.id);
      }

      this.hidingEntity = function (entity) {
        return hiddenEntity === entity.id;
      };

      this.animatingEntity = function (entity) {
        return animatedEntity === entity.id;
      };

      this.showingEditEntityForm = function (entity) {
        return editingEntity(entity) && !hideEditForm;
      };

      this.showingNewEntityForm = function () {
        return vm.showingNewEntity && !hideNewForm;
      };


      //
      // Methods called after load
      //
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

      function resetNewEntity() {
        if (vm.showingNewEntity) {
          // Trigger animation
          hideNewForm = true;
          // Return promise
          return animationTimers.delayOut().then(hide);
        }
        else
          return $q.resolve();

        function hide() {
          if (vm.newEntity.form) {
            vm.newEntity.form.$setPristine();
          }
          vm.showingNewEntity = false;
          vm.newEntity.entity = null;
          vm.entityCreateErrors = null;
          hideNewForm = false;
        }
      }

      function resetEditEntity() {
        if (vm.editEntity.entity) {
          // Trigger animation
          hideEditForm = true;
          // Keep entity hidden until form is hidden
          hiddenEntity = vm.editEntity.entity.id;
          // Return promise
          return animationTimers.delayOut().then(function () {
            clear();
            if (!animatedEntity)
              hiddenEntity = null;
          });
        }
        else
          return $q.resolve();

        function clear() {
          if (vm.editEntity.form) {
            vm.editEntity.form.$setPristine();
          }
          vm.editEntity.entity = null;
          vm.editEntity.errors = null;
          hideEditForm = false;
        }
      }

      function createEntity(entity) {
        var body = options.makeEntityBody(entity);
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
        var body = options.makeEntityBody(entity);
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
        resetNewEntity().then(insert);

        function insert() {
          vm.entitys.splice(0, 0, entity);
        }
      }

      function entityUpdated(entity) {
        // Animate change to entity
        hiddenEntity = vm.editEntity.entity.id;
        animatedEntity = vm.editEntity.entity.id;
        resetEditEntity().then(replace).finally(show);

        function replace() {
          var id = entity.id;
          var found = $filter('filter')(vm.entitys, function (o) {
            return o.id === id;
          });
          if (found && found.length === 1) {
            angular.copy(entity, found[0]);
          }
        }

        function show() {
          hiddenEntity = null;
          animationTimers.delayIn().then(function () {
            animatedEntity = null;
          });
        }
      }

      function entityCreateError(entity, response) {
        vm.showHttpErrorToast(response.status);
        vm.entityCreateErrors = vm.errorsOfResponse(response);
      }

      function entityUpdateError(entity, response) {
        vm.showHttpErrorToast(response.status);
        vm.editEntity.errors = vm.errorsOfResponse(response);
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




