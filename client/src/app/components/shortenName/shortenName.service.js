/**
 * @ngdoc service
 * @name app.components.shortenName
 * @description
 * Shortens a full firstname and full lastname to full first name and last initial.
 */
(function () {
  'use strict';

  angular
    .module('app.components')
    .factory('shortenName', factory);

  /** @ngInject */
  function factory() {

    return shortenName;

    /**
     * @ngdoc function
     * @name shortenName
     * @methodOf app.components.shortenName
     *
     * @param {String} name
     * Overrides for HTML content (ok button, cancel button, message, title)
     * @returns {String} name
     */
    function shortenName(name) {
      var result = name;

      if (result) {
        // Remove extraneous white space
        result = result.trim().replace(/ +/g, " ");
        var names = result.split(" ");
        if (names.length == 2) {
          var firstName = names[0];
          var lastName = names[1];
          if (!isInitialed(firstName) && !isInitialed(lastName) && !isShortName(lastName) &&
            isProperNoun(lastName)) {
            result = firstName + ' ' + lastName.substr(0, 1) + '.';
          }
        }
      }
      return result;
    }

    function isShortName(name) {
      return name.length <= 2;
    }

    function isInitialed(name) {
      return name && name.charAt(name.length-1) == '.';
    }

    function isProperNoun(name) {
      return name.length >= 2 &&
        isUpper(name.charAt(0)) &&
          isLower(name.charAt(1));

      function isUpper(c) {
        return c.toUpperCase() == c;
      }

      function isLower(c) {
        return c.toLowerCase() == c;
      }
    }
  }
})();
