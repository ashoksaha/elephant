/* global malarkey:false, moment:false */
(function() {
  'use strict';

  angular
    .module('flavido')
    .constant('moment', moment)
    .constant('_', window._);
})();
