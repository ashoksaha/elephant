(function() {
  'use strict';

  angular
    .module('flavido')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, ngMeta) {

    $log.debug('runBlock end');
    ngMeta.init();
  }

})();
