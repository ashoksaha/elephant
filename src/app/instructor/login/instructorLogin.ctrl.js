(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorLoginController', InstructorLoginController);

    /** @ngInject */
    function InstructorLoginController($http, CommonInfo, $log, growl, $state) {
        var vm = this;

        vm.user = {
            email: '',
            password: '',
            type: 3
        };

        vm.login = login;

        activate();

        function activate() {
            getUserType();
        }

        function getUserType() {
            $http.get(CommonInfo.getAppUrl() + "/getadmintypes").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            userType = response.data.data;
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

        function login() {
            if (vm.user && vm.user.email && vm.user.password) {
                $http.post(CommonInfo.getAppUrl() + "/adminlogin", vm.user).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                //growl.success('Login successfuly');
                                CommonInfo.setInfo('instructorInfo', response.data.data);
                                $state.go('instructor.dashboard');
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
