(function() {
  'use strict';

  angular
    .module('flavido')
    .directive('footerBar', footerBar);

  /** @ngInject */
  function footerBar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/footer/footer.html',
      scope: {
          userName: '=',
          userEmail: '=',
          userImage: '='
      },
      controller: FooterbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function FooterbarController(moment) {
      var vm = this;

    }
  }

})();
