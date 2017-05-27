(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentMainController', StudentMainController);

    /** @ngInject */
    function StudentMainController(CommonInfo, SweetAlert, $state) {
        var vm = this;

        vm.studentInfo = {};
        vm.scopeVariable = 2;

        vm.logout = logout;

        activate();

        function activate() {
            vm.studentInfo = CommonInfo.getInfo('studentInfo');
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
                    CommonInfo.setInfo('studentInfo', '');
                    $state.go('main');
                }
            });
        }
    }
})();
