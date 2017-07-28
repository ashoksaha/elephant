(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('TestSeriesController', TestSeriesController);

    /** @ngInject */
    function TestSeriesController(CommonInfo, $state, $http, $mdDialog, $scope, $log, growl) {
        var vm = this;

        vm.showTests = showTests;

        vm.loginStage = 1;
        vm.student = {
            student_id: '',
            emailorphone: '',
            password: '',
            phone: ''
        };
        vm.verification = {
            OTP: '',
            student_id: '',
            phone: ''
        };

        vm.login = login;
        vm.otpVerification = otpVerification;
        vm.sendOTP = sendOTP;

        activate();

        function activate() {
            getAllTestSeries();
        }

        function getAllTestSeries() {
            $http.get(CommonInfo.getTestSeriesAppUrl() + "/testSeries/all").then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.testSeriesList = response.data.testSeries;
                        } else {
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

        function showTests(evt, series) {
            var studentInfo = CommonInfo.getInfo('studentInfo');
            if(studentInfo && studentInfo.userId) {
                series = series ? series : CommonInfo.getInfo('selectedSeries');
                $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
            } else {
                CommonInfo.setInfo('selectedSeries', series);
                 $mdDialog.show({
                    targetEvent: evt,
                    scope: $scope.$new(),
                    templateUrl: 'app/main/login.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            }
        }

         function login() {
            if (vm.student.emailorphone && vm.student.password) {
                vm.student.fromSource = "flavido";
                $http.post(CommonInfo.getAppUrl() + "/studentlogin", vm.student).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                $mdDialog.hide();
                                //growl.success('Login Successfuly');
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                showTests()
                            } else if (response.data.status == 3) {
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                vm.verification.student_id = response.data.data.userId;
                                vm.student.student_id = response.data.data.userId;
                                if (response.data.message == '2') {
                                    vm.loginStage = 2;
                                }
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
                                CommonInfo.setInfo('studentInfo', response.data.data);
                                showTests();
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

        function sendOTP() {
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
