/**
 * @ngdoc service
 * @name app.crud.crudHelper
 * @description
 * Adds CRUD functionality to a controller
 *
 */
(function () {
  'use strict';

  angular
    .module('app.crud')
    .factory('crudHelper', factory);

  /** @ngInject */
  function factory($log, modalConfirm, $q,
                   $filter, loadingHelper, errorsHelper, toastrHelper, authHelper,
                   waitingState, crudResource, editInProgress, autoFocus, animationTimers) {
    return activate;

    /**
     * @ngdoc function
     * @name activate
     * @methodOf app.crud.crudHelper
     * @description
     * Adds members to a controller:
     * * beginWait()
     * * entityList
     * * editEntity
     * * newEntity
     * @param {Object} vm
     * Controller instance
     * @param {Object} options
     * Controller specific information and callbacks
     * * response array
     * * resourceName
     * * prepareToCreateEntity()
     * * prepareToUpdateEntity()
     * * beforeShowNewEntity()
     * * beforeShowEditEntity()
     * * getEntityDisplayName()
     * * makeEntityBody()
     * * scope
     * * entityKind
     * * errorsMap
    */
    function activate(vm, options) {
      var response = options.response;
      var errorsMap = options.errorsMap;
      var scope = options.scope;

      // Aggregate functionality from other helpers
      authHelper(vm, scope);
      loadingHelper(vm);
      toastrHelper(vm, scope);
      errorsHelper(vm, errorsMap);

      // initialize instance properties

      /**
       * @ngdoc function
       * @name beginWait
       * @methodOf app.crud.crudHelper
       * @description
       * Begins application waiting state
       * @returns {Function} 
       * Ends application waiting state
      */
      vm.beginWait = waitingState.beginWait;

      /**
       * @ngdoc property
       * @name entityList
       * @propertyOf app.crud.crudHelper
       * @description
       * Object to manage a list of entities
       */
      vm.entityList = {
        deleteItem: deleteEntity,
        hidingItem: hidingEntity,
        animatingItem: animatingEntity,
        entitys: [],
        kind: options.entityKind,
        allowDelete: function () {
          return vm.loggedIn;
        }
      };

      /**
       * @ngdoc property
       * @name editEntity
       * @propertyOf app.crud.crudHelper
       * @description
       * Object to edit a particular entity
       */
      vm.editEntity = {
        form: null,
        errors: null,
        cancel: cancelEditEntity,
        submit: submitEditEntity,
        ok: 'Save',
        entity: null,
        show: showEditEntity,
        showingForm: showingEditEntityForm,
        allow: function () {
          return vm.loggedIn;
        },
        clearErrors: function (names) {
          vm.clearErrors(vm.editEntity.errors, names);
        }
      };

      /**
       * @ngdoc property
       * @name editEntity
       * @propertyOf app.crud.crudHelper
       * @description
       * Object to create a new entity
       */
      vm.newEntity = {
        form: null,
        errors: null,
        cancel: cancelNewEntity,
        submit: submitNewEntity,
        ok: 'Add',
        entity: null,
        show: showNewEntity,
        showingForm: showingNewEntityForm,
        showing: false,
        allow: function () {
          return vm.loggedIn;
        },
        clearErrors: function (names) {
          vm.clearErrors(vm.newEntity.errors, names);
        }
      };

      // Allow new and edit operations to be cancelled
      editInProgress.registerOnQueryState(scope, getEditorState);
      editInProgress.registerOnClose(scope, closeEditors);

      if (angular.isArray(response))
        entityLoadingHasCompleted(response);
      else
        entityLoadHasFailed(response);

      // Unique identifiers
      var CRUD = 'crud';
      var REFOCUS = 'refocus';

      // Flags used to animate forms
      var hideEditForm = false;
      var hideNewForm = false;
      var hiddenEntity = null;
      var animatedEntity = null;

      // Provide information used to cancel editing
      function getEditorState(event, data) {
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
      }


      // Method to close editors.  May be called to close new form when edit button is clicked.
      // May also be called when leaving view.
      function closeEditors(event, state, defer) {
        if (state.name == CRUD) {
          // add promises to array parameter
          defer.push(resetNewEntity(), resetEditEntity());
        }
      }

      //
      // Methods called from view
      //

      function deleteEntity(entity, confirmDelete) {
        vm.clearToast();

        editInProgress.closeEditors().then(del);

        function del() {
          if (angular.isUndefined(confirmDelete))
            confirmDelete = true;
          if (confirmDelete) {
            modalConfirm.confirm({
              title: 'Confirm Delete', message: 'Are you sure that you want to delete "' +
              options.getEntityDisplayName(entity) + '"?'
            })
              .then(function () {
                removeEntity(entity)
              });
          }
          else {
            removeEntity(entity)
          }
        }
      }

      function submitNewEntity() {
        var submitEntity = options.prepareToCreateEntity(vm.newEntity.entity);
        createEntity(submitEntity);
      }

      function showNewEntity() {

        vm.clearToast();

        editInProgress.closeEditors().then(
          show
        );

        function show() {
          hideNewForm = false;
          vm.newEntity.entity = {};
          options.beforeShowNewEntity().then(showEntity);

          function showEntity() {
            vm.newEntity.showing = true;
            // new entity form should have an element with the following attribute.
            // fe-auto-focus='refocus'
            autoFocus(options.scope, REFOCUS);
          }
        }
      }

      function cancelNewEntity() {
        resetNewEntity();
      }

      function submitEditEntity() {
        var submit = options.prepareToUpdateEntity(vm.editEntity.entity);
        updateEntity(submit);
      }

      function showEditEntity(entity) {

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
      }

      function cancelEditEntity() {
        resetEditEntity();
      }

      function editingEntity(entity) {
        return vm.editEntity.entity && (vm.editEntity.entity.id == entity.id);
      }

      function hidingEntity(entity) {
        return hiddenEntity === entity.id;
      }

      function animatingEntity(entity) {
        return animatedEntity === entity.id;
      }

      function showingEditEntityForm(entity) {
        return editingEntity(entity) && !hideEditForm;
      }

      function showingNewEntityForm() {
        return vm.newEntity.showing && !hideNewForm;
      }

      //
      // Methods called after load
      //
      function entityLoadingHasCompleted(response) {
        vm.entityList.entitys = response;
        vm.loading.hasCompleted();
      }

      function entityLoadHasFailed(response) {
        $log.error('data error ' + response.status + " " + response.statusText);
        vm.loading.hasFailed(response);
      }

      //
      // Internal methods
      //

      function getResource() {
        return crudResource.getResource(options.resourceName)
      }

      function resetNewEntity() {
        if (vm.newEntity.showing) {
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
          vm.newEntity.showing = false;
          vm.newEntity.entity = null;
          vm.newEntity.errors = null;
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
          vm.entityList.entitys.splice(0, 0, entity);
        }
      }

      function entityUpdated(entity) {
        // Animate change to entity
        hiddenEntity = vm.editEntity.entity.id;
        animatedEntity = vm.editEntity.entity.id;
        resetEditEntity().then(replace).finally(show);

        function replace() {
          var id = entity.id;
          var found = $filter('filter')(vm.entityList.entitys, function (o) {
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
        vm.newEntity.errors = vm.errorsOfResponse(response);
      }

      function entityUpdateError(entity, response) {
        vm.showHttpErrorToast(response.status);
        vm.editEntity.errors = vm.errorsOfResponse(response);
      }

      function entityRemoved(entity) {
        var i = vm.entityList.entitys.indexOf(entity);
        if (i >= 0) {
          vm.entityList.entitys.splice(i, 1);
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
})
();




