/**
 * @ngdoc service
 * @name app.components.editInProgress
 * @description
 * Prompt the user to cancel the edit in progress.  Notify controllers of the
 * outcome.
 *
 * An edit is in progress when the user has chosen a command to show a data entry form, and
 * has changed the value of a form field.
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .service('editInProgress', Service);

  /** @ngInject */
  function Service($q, modalConfirm, $rootScope, autoFocus) {

    var service = this;

    service.closeEditors = closeEditors;
    service.registerOnQueryState = registerOnQueryState;
    service.registerOnConfirmed = registerOnConfirmed;
    service.registerOnClose = registerOnClose;

    /**
     * @ngdoc function
     * @name closeEditors
     * @methodOf app.components.editInProgress
     * @description
     * If an edit is in progress, display a modal prompt to cancel the edit.
     *
     * @returns {Object} promise
     * * Resolved when the edit is cancelled or when there is no edit in progress
     * * Reject if the edit is not cancelled (by the user)
     */
    function closeEditors() {
      var state = emitQuery();
      var promise;
      if (!state.pristine) {
        angular.merge(state.labels, {
          cancel: 'No'
        });
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
      }
      else
        promise = emitClose(state);

      return promise;

      function emitQuery() {
        var data = {
          pristine: true,
          labels: {
            title: 'Discard Changes',
            message: 'Do you want to discard changes on this page?'
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

    /**
     * @ngdoc function
     * @name registerOnQueryState
     * @methodOf app.components.editInProgress
     * @description
     * Register a controller callback to query for the editing state.
     * @param {Object} scope
     * Controller scope
     * @param {Object} callback
     * Controller callback
     */
    function registerOnQueryState(scope, callback) {
      registerEvent(scope, QUERY_EVENT, callback);
    }

    /**
     * @ngdoc function
     * @name registerOnConfirmed
     * @methodOf app.components.editInProgress
     * @description
     * Register a callback to inform controllers that the user was prompted to
     * close the current editor
     * @param {Object} scope
     * Controller scope
     * @param {Object} callback
     * Controller callback
     */
    function registerOnConfirmed(scope, callback) {
      registerEvent(scope, CONFIRMED_EVENT, callback);
    }

    /**
     * @ngdoc function
     * @name registerOnClose
     * @methodOf app.components.editInProgress
     * @description
     * Register a callback to inform controllers that editors should be closed.
     * @param {Object} scope
     * Controller scope
     * @param {Object} callback
     * Controller callback
     */
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
