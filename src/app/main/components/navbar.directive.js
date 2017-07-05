(function() {
    'use strict';

    angular
        .module('flavido')
        .directive('mainNavbar', mainNavbar);

    /** @ngInject */
    function mainNavbar() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/main/components/navbar.html',
            scope: {
                userName: '=',
                userEmail: '=',
                userImage: '='
            },
            controller: MainNavbarController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function MainNavbarController(CommonInfo, SweetAlert, $state, $http, $log) {
            var vm = this;

            vm.studentInfo = {};
            vm.isCollapsed = true;
            vm.profileMenu = false;

            vm.logout = logout;
            vm.menuToggle = menuToggle;

            vm.studentInfo = CommonInfo.getInfo('studentInfo');
            if (vm.studentInfo && vm.studentInfo.userId)
                vm.isStudentLogedIn = true;
            else
                vm.isStudentLogedIn = false;

            function logout() {
                SweetAlert.swal({
                        title: "Are you sure, You want to logout?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55"
                    },
                    function(isConfirm) {
                        //SweetAlert.swal("Booyah!");
                        if (isConfirm) {
                            $http.post(CommonInfo.getAppUrl() + "/studentlogout", { studentId: vm.studentInfo.userId }).then(
                                function(response) {
                                    if (response && response.data) {
                                        if (response.data.status == 1) {
                                            CommonInfo.setInfo('studentInfo', '');
                                            $state.go('main', {}, { reload: true });
                                        } else if (response.data.status == 2) {
                                            $log.log(response.data.message);
                                        }
                                    } else {
                                        $log.log('There is some issue, please try after some time');
                                    }
                                },
                                function(response) {
                                    $log.log('There is some issue, please try after some time');
                                }
                            );
                        }
                    });
            }

            function menuToggle() {
                vm.isCollapsed = !vm.isCollapsed;
                angular.element(document.querySelector('.site-wrap')).toggleClass('active');
            }
        }
    }

})();
