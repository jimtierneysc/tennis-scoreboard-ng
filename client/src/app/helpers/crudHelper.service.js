/**
 * @ngdoc factory
 * @name crudHelper
 * @description
 * Common CRUD functionality shared by CRUD controllers
 *
 */
(function () {
  'use strict';

  /* global _ */

  angular
    .module('frontend')
    .factory('crudHelper', crudHelperFunc);

  /** @ngInject */
  function crudHelperFunc($log, $q, modalConfirm, toastr, feUtils, $filter, loadingHelper, toastrHelper) {
    var service = {
      activate: activateFunc
    };

    var vm = null;

    var getResources = null;
    var beforeSubmitNewEntity = null;
    var beforeSubmitEditEntity = null;
    var beforeShowNewEntityForm = null;
    var beforeShowEditEntityForm = null;
    var getEntityDisplayName = null;
    var entityFieldMap = {};
    var makeEntityBody = null;

    return service;

    function activateFunc(_vm_, controllerOptions) {
      var response = controllerOptions.response;
      getResources = controllerOptions.getResources;
      beforeSubmitNewEntity = controllerOptions.beforeSubmitNewEntity;
      beforeSubmitEditEntity = controllerOptions.beforeSubmitEditEntity;
      beforeShowNewEntityForm = controllerOptions.beforeShowNewEntityForm;
      beforeShowEditEntityForm = controllerOptions.beforeShowEditEntityForm;
      getEntityDisplayName = controllerOptions.getEntityDisplayName;
      makeEntityBody = controllerOptions.makeEntityBody;
      entityFieldMap = controllerOptions.entityFieldMap;
      var scope = controllerOptions.scope;

      // Initialize controller
      vm = _vm_;
      loadingHelper.activate(vm);
      toastrHelper.activate(vm, scope);
      vm.trashEntity = trashEntity;
      vm.submitNewEntityForm = submitNewEntityForm;
      vm.showNewEntityForm = showNewEntityForm;
      vm.hideNewEntityForm = hideNewEntityForm;
      vm.submitEditEntityForm = submitEditEntityForm;
      vm.showEditEntityForm = showEditEntityForm;
      vm.hideEditEntityForm = hideEditEntityForm;
      // vm.resolveView = $q.defer();


      vm.newEntity = {};
      vm.showingNewEntityForm = false;
      vm.showingEditEntityForm = showingEditEntityForm;
      vm.newEntityForm = null;
      vm.editEntityForm = null;
      vm.entitys = [];
      vm.entityCreateErrors = null;
      vm.entityUpdateErrors = null;

      if (angular.isDefined(response)) {
        if (angular.isArray(response)) 
          entityLoaded(response);
        else 
          // error
          entityLoadFailed(response);
      }
      else {
        getEntitys();
      }
    }

    function trashEntity(entity, confirmDelete) {
      $log.info('destroy');
      if (angular.isUndefined(confirmDelete))
        confirmDelete = true;
      if (confirmDelete) {
        modalConfirm.confirm({
          title: 'Confirm Delete', text: 'Are you sure you want to delete "' +
          _.escape(getEntityDisplayName(entity)) + '"?'
        })
          .then(function () {
            $log.info('delete confirmed');
            removeEntity(entity)
          });
      }
      else {
        removeEntity(entity)

      }
    }

    function submitNewEntityForm() {
      $log.info('submitNewEntityForm');
      var submitEntity = beforeSubmitNewEntity(vm.newEntity);
      createEntity(submitEntity);
    }

    function showNewEntityForm() {
      $log.info('showNewEntityForm');
      beforeShowNewEntityForm();
      vm.showingNewEntityForm = true;
    }

    function hideNewEntityForm() {
      $log.info('hideNewEntityForm');
      if (vm.newEntityForm) {
        vm.newEntityForm.$setPristine();
      }
      vm.showingNewEntityForm = false;
      vm.newEntity = {};
      vm.entityCreateErrors = null;

    }

    function submitEditEntityForm() {
      $log.info('submitEditEntityForm');
      var submit = beforeSubmitEditEntity(vm.editEntity);
      updateEntity(submit);
    }

    function showEditEntityForm(entity) {
      $log.info('showEditEntityForm');
      // Edit a copy, so can discard unless click Save
      vm.editEntity = angular.copy(entity);
      beforeShowEditEntityForm(entity);
      //vm.showingEditEntityForm = ent;
    }

    function hideEditEntityForm() {
      $log.info('hideEditEntityForm');
      if (vm.editEntityForm) {
        vm.editEntityForm.$setPristine();
      }
      vm.editEntity = null;
      vm.entityUpdateErrors = null;

    }

    function showingEditEntityForm(entity) {
      return vm.editEntity && (vm.editEntity.id == entity.id);
    }

    //
    // Internal methods
    //

    function getEntitys() {
      getResources().query(
        function (response) {
          entityLoaded(response);
        },
        function (response) {
          entityLoadFailed(response);
        }
      );
    }

    function entityLoaded(response) {
      $log.info('received data');
      vm.entitys = response;
      vm.loadingHasCompleted();
    }

    function entityLoadFailed(response) {
      $log.error('data error ' + response.status + " " + response.statusText);
      vm.loadingHasFailed(response);
    }
    
    function createEntity(entity) {
      var body = makeEntityBody(entity);
      getResources().save(body,
        function (response) {
          $log.info('create/save');
          $log.info(response);
          var newEntity = angular.merge(response, entity);
          entityCreated(newEntity);
        },
        function (response) {
          $log.error('create error ' + response.status + " " + response.statusText);
          entityCreateError(entity, response)
        }
      );
    }


    function updateEntity(entity) {
      var id = entity.id;
      var key = {id: id};
      var body = makeEntityBody(entity);
      getResources().update(key, body,
        function (response) {
          $log.info('update');
          $log.info(response);
          var updatedEntity = angular.merge(response, entity);
          entityUpdated(updatedEntity);
        },
        function (response) {
          $log.error('update error ' + response.status + " " + response.statusText);
          entityUpdateError(entity, response)
        }
      );
    }

    function removeEntity(entity) {
      var id = entity.id;
      var key = {id: id};
      getResources().remove(key,
        function (response) {
          $log.info('remove entity');
          $log.info(response);
          entityRemoved(entity);
        },
        function (response) {
          $log.error('remove entity error ' + response.status + " " + response.statusText);
          entityRemoveError(entity, response)
        }
      );

    }

    function entityCreated(entity) {
      hideNewEntityForm();
      vm.entitys.splice(0, 0, entity);
      vm.entityCreateErrors = null;
    }

    function entityUpdated(entity) {
      hideEditEntityForm();
      var id = entity.id;
      var found = $filter('filter')(vm.entitys, function (o) {
        return o.id === id;
      });
      if (found && found.length === 1) {
        angular.copy(entity, found[0]);
      }
      else {
        $log.error('id not found: ' + id);
      }
    }

    function normalizeErrors(data) {
      var errors = feUtils.normalizeObjectNames(data, entityFieldMap);
      return errors;
    }

    function entityCreateError(entity, response) {
      // fixup errors
      var errors = normalizeErrors(response.data);
      vm.entityCreateErrors = errors;
    }

    function entityUpdateError(entity, response) {
      // fixup errors
      var errors = normalizeErrors(response.data);
      vm.entityUpdateErrors = errors;
    }

    function entityRemoved(entity) {
      $log.info('entityRemoved ' + entity.id);
      vm.entityRemoveErrors = null;
      var i = vm.entitys.indexOf(entity);
      if (i >= 0) {
        vm.entitys.splice(i, 1);
      }
    }

    function entityRemoveError(entity, response) {
      var errors = normalizeErrors(response.data);
      var message = "";
      if (angular.isDefined(errors.other))
        message = errors.other;
      vm.showToastrError(message, "Delete Error");
    }

  }
})();




