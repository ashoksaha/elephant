(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminUserController', AdminUserController);

    /** @ngInject */
    function AdminUserController(CommonInfo, $http, growl, _) {
        var vm = this;

        vm.isCollapsed = true;
        vm.userListTab = 1;
        vm.userTab = 0;
        vm.users = [];
        vm.userList = [];

        vm.selectUserType = selectUserType;

        activate();

        function activate() {
            // getAllUsers();
            getUserType();
        }

        function getAllUsers() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.users = response.data.data;
                            selectUserType(0, vm.userTypeList[0]);
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

        function getUserType() {
            $http.get(CommonInfo.getAppUrl() + "/getadmintypes").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.userTypeList = response.data.data;
                            getAllUsers();
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

        function selectUserType(index, type) {
            vm.userTab = index;
            vm.userType = type.Name;
            vm.userList = _.filter(vm.users, { type: type.id });
            vm.userCount = {
                active: _.size(_.filter(vm.userList, { 'status': 1})),
                inactive: _.size(_.filter(vm.userList, { 'status': 0}))
            };
        }
    }
})();
