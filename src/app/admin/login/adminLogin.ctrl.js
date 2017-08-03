(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminLoginController', AdminLoginController);

    /** @ngInject */
    function AdminLoginController($http, CommonInfo, $log, growl, $state) {
        var vm = this;

        vm.userType = [];
        vm.user = {
            email: '',
            password: '',
            type: 2
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
                            vm.userType = response.data.data;
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
                                if(response.data.data.emailId == 'negi.udit@gmail.com' || response.data.data.emailId == 'yogesh@flavido.com') {
                                    response.data.data.isAdmin = true;
                                }
                                CommonInfo.setInfo('userInfo', response.data.data);
                                $state.go('admin.dashboard');
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
