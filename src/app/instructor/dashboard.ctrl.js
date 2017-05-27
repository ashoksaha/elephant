(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorDashboardController', InstructorDashboardController);

    /** @ngInject */
    function InstructorDashboardController(CommonInfo) {
        var vm = this;

        activate();

        function activate() {
            vm.instructorInfo = CommonInfo.getInfo('instructorInfo');
        }
    }
})();
