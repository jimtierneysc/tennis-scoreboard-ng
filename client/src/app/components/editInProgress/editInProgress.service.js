/**
 * @ngdoc service
 * @name editInProgress
 * @description
 * Prompt the user to cancel the edit in progress, and notify controllers
 * whether cancelled or not.
 */
(function () {
  'use strict';

  angular
    .module('frontendComponents')
    .service('editInProgress', Service);

  /** @ngInject */
  function Service($q, modalConfirm, $rootScope, autoFocus) {

    var service = this;

    service.closeEditors = closeEditors;
    service.registerOnQueryState = registerOnQueryState;
    service.registerOnConfirmed = registerOnConfirmed;
    service.registerOnClose = registerOnClose;

    // Return a promise.  The promise will be rejected when there is an edit in-
    // progress (e.g.; entering a title for a new entity) and the user chooses not to cancel
    // editing.
    function closeEditors() {
      var state = emitQuery(name);
      angular.merge(state.labels, {
        cancel: 'No'
      });
      var promise;
      if (!state.pristine)
        promise = modalConfirm.confirm(state.labels).then(
          function () {
            return emitClose(state).then(function () {
              emitConfirmed(state, true);
            });
          },
          function () {
            emitConfirmed(state, false);
            return $q.reject();
          });
      else
        promise = emitClose(state);

      return promise;
      
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

      function emitConfirmed(state, resolved) {
        $rootScope.$emit(CONFIRMED_EVENT, state, resolved);
        if (!resolved && state.autoFocus && state.autoFocusScope) {
          // Restore focus
          autoFocus(state.autoFocusScope, state.autoFocus);
        }
      }

      function emitClose(state) {
        var deferred = [];
        $rootScope.$emit(CLOSE_EVENT, state, deferred);
        var all = $q.all(deferred);
        return all;
      }
    }

    // Register a callback to retrieve the state of an editor
    // from a controller.
    function registerOnQueryState(scope, queryCallback) {
      registerEvent(scope, QUERY_EVENT, queryCallback);
    }

    // Register a callback to inform a controller that the user was prompted to
    // close the current editor.
    function registerOnConfirmed(scope, callback) {
      registerEvent(scope, CONFIRMED_EVENT, callback);
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
    var CONFIRMED_EVENT = 'editing-in-progress:confirmed';
    var CLOSE_EVENT = 'editing-in-progress:close';
  }

})();
