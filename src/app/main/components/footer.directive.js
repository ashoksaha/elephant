(function() {
  'use strict';

  angular
    .module('flavido')
    .directive('mainFooterBar', mainFooterBar);

  /** @ngInject */
  function mainFooterBar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/components/footer.html',
      scope: {
          userName: '=',
          userEmail: '=',
          userImage: '='
      },
      controller: MainFooterbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function MainFooterbarController(CommonInfo) {
      var vm = this;

      vm.studentInfo = {};

      vm.studentInfo = CommonInfo.getInfo('studentInfo');
    }
  }

})();
