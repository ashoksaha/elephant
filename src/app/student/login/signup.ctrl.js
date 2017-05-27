(function() {
    'use strict';

    angular
        .module('flavido')
        .factory('SignUp', SignUp);

    /** @ngInject */
    function SignUp() {
        vm.verification = {
            OTP: '',
            student_id: '',
            phone: ''
        };
        vm.student = {
            username: '',
            email_id: '',
            phone: '',
            password: ''
        };
        return {
            login: function(loginInfo) {
                $http.post(CommonInfo.getAppUrl() + "/studentlogin", vm.student).then(
                    function(response) {
                        return response;
                    },
                    function(response) {
                        return response;
                    }
                );
            },
            getInfo: function(item) {
                // if (!$localStorage.fInfoObj || !$localStorage.fInfoObj.user)
                //     $state.go('main');
                // else
                if ($localStorage && $localStorage.fInfoObj)
                    return angular.copy($localStorage.fInfoObj[item]);
                else
                    return {};
            },
            setInfo: function(item, value) {
                var obj = $localStorage.fInfoObj || {};
                obj[item] = angular.copy(value);
                $localStorage.fInfoObj = obj;
            },
            reset: function() {
                $localStorage.$reset();
            },
            getAppUrl: function() {
                return 'http://api.fundsplanner.com/v0';
            },
            showAlert: function(text) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(text)
                    .hideDelay(3000)
                    .position('top right')
                );
            }
        };
    }
})();
