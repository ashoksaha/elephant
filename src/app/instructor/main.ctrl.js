(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorController', InstructorController);

    /** @ngInject */
    function InstructorController(CommonInfo, $state, SweetAlert) {
        var vm = this;

        vm.isCollapsed = true;
        vm.instructorInfo = {};

        vm.logout = logout;

        activate();

        function activate() {
            vm.instructorInfo = CommonInfo.getInfo('instructorInfo');
        }

        function logout() {
            SweetAlert.swal({
                title: "Are you sure, You want to logout?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55"
            },
            function(isConfirm) {
                //SweetAlert.swal("Booyah!");
                if(isConfirm){
                    CommonInfo.setInfo('instructorInfo', '');
                    $state.go('instructorLogin');
                }
            });
        }
    }
})();
