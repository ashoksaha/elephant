(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('ResetPasswordController', ResetPasswordController);

    /** @ngInject */
    function ResetPasswordController(CommonInfo, $http, growl, $state, $stateParams) {
        var vm = this;

        vm.student_email = '';
        vm.student = {
            password: '',
            confPassword: ''
        };

        vm.sendForgotPassword = sendForgotPassword;
        vm.resetPassword = resetPassword;

        activate();

        function activate() {

        }

        function sendForgotPassword() {
            if (vm.student_email) {
                $http.post(CommonInfo.getAppUrl() + "/studentresetpasswordrequest", { student_email: vm.student_email }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success("You should soon receive an email allowing you to reset your password. Please make sure to check your spam if you can't find the email.");
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.warning('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }

        function resetPassword() {
            var code = $stateParams.code;
            var caseType = $stateParams.casetype;
            if (vm.student.password && vm.student.confPassword && vm.student.password == vm.student.confPassword) {
                $http.post(CommonInfo.getAppUrl() + "/studentresetpassword", { password: vm.student.password, token: code, case_type: caseType }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Password changed successfuly');
                                $state.go('login');
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.warning('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }
    }
})();
