(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorResetPasswordController', InstructorResetPasswordController);

    /** @ngInject */
    function InstructorResetPasswordController($http, CommonInfo, $log, growl) {
        var vm = this;
        var userType = [];

        vm.user = {
            email: ''
        };

        vm.resetPassword = resetPassword;

        activate();

        function activate() {

        }

        function resetPassword() {
            if (vm.user && vm.user.email) {
                $http.post(CommonInfo.getAppUrl() + "/adminresetpassword", vm.user).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Mail sent, please check your registered mail');
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
