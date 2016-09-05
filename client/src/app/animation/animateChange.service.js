/**
 * @ngdoc service
 * @name app.animation.animateChange
 * @description
 * Methods to animate some elements in a view by controlling a sequence of
 * delays and state changes.
 */
(function () {
  'use strict';

  angular
    .module('app.animation')
    .factory('animateChange', factory);

  /** @ngInject */
  function factory(animationTimers, $q) {
    return {
      promiseHideThenShow: promiseHideThenShow,
      hideThenShow: hideThenShow,
      toggleShow: toggleShow
    };

    /**
     * @ngdoc function
     * @name promiseHideThenShow
     * @methodOf app.animation.animateChange
     * @description
     * Given a promise and some callbacks,
     * animate the elements before and after making a change.
     * @param {Object} promise
     * A promise to complete before make a change
     * @param {Function} change
     * Function to make the change
     * @param {Object} hideAndShow
     * Contains Function members: hideChanging, hideChanged, showChanged and reset.
     * @param {Function} reject
     * Function called when promise is rejected
     * @param {Function} final
     * Function called when promise is finalized
     */
    function promiseHideThenShow(promise, change, hideAndShow, reject, final) {

      // Delay to let changing data hide
      var timerPromise = animationTimers.delayOut();

      var all = $q.all({timer: timerPromise, promise: promise});

      // Set flags so that changing values will be hidden
      hideAndShow.hideChanging();

      all.then(
        function (hash) {
          var response = hash.promise;

          change(response);
          // Note: There must not be a digest between change() and hideChanged().
          // Otherwise, the changed elements will be rendered without animation.

          // Set flags so that new elements will be hidden, initially.
          // Flags also enable ng-class.
          hideAndShow.hideChanged();

          // Let ng-class be processed
          animationTimers.digest().then(function () {

            // Show new elements
            hideAndShow.showChanged();

            // Reset flags after new elements have shown
            animationTimers.delayIn().then(hideAndShow.reset);
          });

        },
        function (response) {
          if (reject)
            reject(response);
          hideAndShow.reset();
        }).finally(
        function () {
          if (final) {
            final();
          }
        });
    }

    /**
     * @ngdoc function
     * @name hideThenShow
     * @methodOf app.animation.animateChange
     * @description
     * Given a change function and some other callbacks,
     * animate the elements before and after making a change.
     * @param {Function} change
     * function to make the change
     * @param {Object} hideAndShow
     * Contains Function members: hideChanging, hideChanged, showChanged and reset.
     */
    function hideThenShow(change, hideAndShow) {

      hideAndShow.hideChanging();

      animationTimers.delayOut().then(function () {

        change();

        hideAndShow.hideChanged();

        animationTimers.digest().then(function () {
          hideAndShow.showChanged();

          animationTimers.delayIn().then(
            hideAndShow.reset);
        });
      });
    }

    /**
     * @ngdoc function
     * @name toggleShow
     * @methodOf app.animation.animateChange
     * @description
     * Given a toggle function and two other callbacks, animate the
     * elements that are to be shown or hidden by toggling a setting.
     * @param {Function} toggle
     * Function to toggle a setting
     * @param {Function} enableNgClass
     * Function to set flags to enable animation
     * @param {Function} reset
     * Function to set flags to disable animation
     */
    function toggleShow(toggle, enableNgClass, reset) {
      // Set flags to enable  ng-class
      enableNgClass();

      // Eval ng-class
      animationTimers.digest().then(function () {

        // Change setting
        var show = toggle();

        // Wait for new elements to finish showing or hiding then
        // reset flags
        var delay = show ? animationTimers.delayIn : animationTimers.delayOut;
        delay().then(reset);
      });
    }
  }
})();




