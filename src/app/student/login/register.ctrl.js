(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('RegisterController', RegisterController);

    /** @ngInject */
    function RegisterController($http, CommonInfo, growl, $state) {
        var vm = this;

        vm.registerStage = 1;
        vm.showOTP = false;
        vm.student = {
            username: '',
            email_id: '',
            phone: '',
            password: ''
        };
        vm.verification = {
            OTP: '',
            student_id: '',
            phone: ''
        };

        vm.signup = signup;
        vm.otpVerification = otpVerification;
        vm.sendOtp = sendOtp;

        activate();

        function activate() {

        }

        function signup() {
            if (vm.student && vm.student.username && vm.student.email_id && vm.student.password) {
                $http.post(CommonInfo.getAppUrl() + "/studentregister", vm.student).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1 && response.data.data && response.data.data.userId) {
                                vm.registerStage = 2;
                                vm.verification.student_id = response.data.data.userId;
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
            } else {
                growl.info('Please enter all fields');
            }
        }

        function otpVerification() {
            if (vm.verification && vm.verification.phone && vm.verification.student_id && vm.verification.OTP) {
                $http.post(CommonInfo.getAppUrl() + "/verifyotp", vm.verification).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                //growl.success('Mobile verified');
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                $state.go('dashboard')
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

        function sendOtp() {
            if (vm.verification && vm.verification.phone && vm.verification.student_id) {
                $http.post(CommonInfo.getAppUrl() + "/verifymobileandsendotp", vm.verification ).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('OTP send');
                                vm.showOTP = true;
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
