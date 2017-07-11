(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController(CommonInfo, $http, growl, $state) {
        var vm = this;

        vm.showOtpField = false;

        vm.loginStage = 1;
        vm.verification = {
            OTP: '',
            student_id: '',
            phone: ''
        };

        vm.login = login;
        vm.otpVerification = otpVerification;
        vm.sendOtp = sendOtp;

        activate();

        function activate() {

        }

        function login() {
            if (vm.student.emailorphone && vm.student.password) {
                $http.post(CommonInfo.getAppUrl() + "/studentlogin", vm.student).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                $state.go('dashboard');
                                location.reload();
                            } else if (response.data.status == 3) {
                                //CommonInfo.setInfo('studentInfo', response.data.data);
                                vm.verification.student_id = response.data.data.userId;
                                vm.verification.phone = response.data.data.mobile;
                                if(response.data.message == '1')
                                    vm.showOtpField = true;
                                vm.loginStage = 2;
                                // if (response.data.message == '2') {
                                //     vm.loginStage = 2;
                                // }
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

        function otpVerification() {
            if (vm.verification && vm.verification.OTP && vm.verification.student_id && vm.verification.phone) {
                $http.post(CommonInfo.getAppUrl() + "/verifyotp", vm.verification).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                //growl.success('Mobile verified');
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                $state.go('dashboard');
                                location.reload();
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

        // function forgotPassword() {
        //     vm.loginStage = 4;
        // }

        // function sendForgotPassword() {
        //     if (vm.student_email) {
        //         $http.post(CommonInfo.getAppUrl() + "/studentresetpassword", { student_email: vm.student_email }).then(
        //             function(response) {
        //                 if (response && response.data) {
        //                     if (response.data.status == 1) {
        //                         growl.success('Mail sent, please check your registered mail');
        //                     } else if (response.data.status == 2) {
        //                         growl.info(response.data.message);
        //                     }
        //                 } else {
        //                     growl.warning('There is some issue, please try after some time');
        //                 }
        //             },
        //             function(response) {
        //                 growl.warning('There is some issue, please try after some time');
        //             }
        //         );
        //     }
        // }

        function sendOtp() {
            if (vm.verification && vm.verification.phone && vm.verification.student_id) {
                $http.post(CommonInfo.getAppUrl() + "/verifymobileandsendotp", vm.verification).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('OTP send');
                                vm.showOtpField = true;
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
