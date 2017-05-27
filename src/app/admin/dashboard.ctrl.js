(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminDashboardController', AdminDashboardController);

    /** @ngInject */
    function AdminDashboardController(CommonInfo) {
        var vm = this;

        vm.userInfo = {};

        activate();

        function activate() {
            vm.userInfo = CommonInfo.getInfo('userInfo');
        }
    }
})();
