/**
 * @ngdoc service
 * @name editInProgress
 * @description
 * Prompt the user to cancel the edit in progress, and notify controllers
 * if cancelled or not.
 */
(function () {
  'use strict';

  angular
    .module('frontend-components')
    .service('editInProgress', Service);

  /** @ngInject */
  function Service($q, modalConfirm, $rootScope, autoFocus) {

    var service = this;

    service.closeEditors = closeEditors;
    service.registerOnQueryState = registerOnQueryState;
    service.registerOnCloseRejected = registerOnCloseRejected;
    service.registerOnClose = registerOnClose;

    // Return a promise.  The promise will be rejected when there is an edit in-
    // progress (e.g.; entering a title for a new something) and the user chooses not to cancel
    // editing.
    function closeEditors() {
      var deferredObject = $q.defer();
      var state = emitQuery(name);
      angular.merge(state.labels, {
        cancel: 'No'
      });
      if (!state.pristine)
        modalConfirm.confirm(state.labels).then(
          function () {
            emitClose(state);
            deferredObject.resolve();
          },
          function () {
            emitRejected(state);
            deferredObject.reject();
          });
      else {
        emitClose(state);
        deferredObject.resolve();
      }

      return deferredObject.promise;


      function emitQuery() {
        var data = {
          pristine: true,
          labels: {
            title: 'Discard Changes',
            text: 'Do you want to discard changes on this page?'
          }
        };
        $rootScope.$emit(QUERY_EVENT, data);
        return data;
      }

      function emitRejected(state) {
        $rootScope.$emit(REJECTED_EVENT, state);
        if (state.autoFocus) {
          autoFocus(state.autoFocus);
        }
      }

      function emitClose(state) {
        $rootScope.$emit(CLOSE_EVENT, state);
      }
    }
    

    // Register a callback used by this service to retrieve the state of an editor
    // from a controller.
    function registerOnQueryState(scope, queryCallback) {
      registerEvent(scope, QUERY_EVENT, queryCallback);
    }

    // Register a callback to inform a controller that a the prompt to
    // close the current editor was rejected by the user.
    function registerOnCloseRejected(scope, callback) {
      registerEvent(scope, REJECTED_EVENT, callback);
    }

    // Register a callback to inform a controller that it's editors should be closed.
    function registerOnClose(scope, callback) {
      registerEvent(scope, CLOSE_EVENT, callback);
    }

    function registerEvent(scope, name, callBack) {
      var on = $rootScope.$on(name, callBack);
      scope.$on('$destroy', on);
    }

    var QUERY_EVENT = 'editing-in-progress:query';
    var REJECTED_EVENT = 'editing-in-progress:rejected';
    var CLOSE_EVENT = 'editing-in-progress:close';
  }

})();
