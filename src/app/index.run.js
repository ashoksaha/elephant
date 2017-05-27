(function() {
  'use strict';

  angular
    .module('flavido')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
