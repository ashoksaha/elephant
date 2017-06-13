(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminOrderListController', AdminOrderListController);

    /** @ngInject */
    function AdminOrderListController(CommonInfo, $http, growl, $log, _, $scope) {
        var vm = this;

        vm.isCollapsed = true;
        vm.studentSearchText;

        vm.getAllOrders = getAllOrders;

        activate();

        function activate() {
            getAllCategories();
            getAllInstructors();
            vm.getAllOrders(0);
        }

        function getAllOrders(page) {
            vm.currentPage = page;
            $http.post(CommonInfo.getAppUrl() + "/getallorders", { page : page , searchText : vm.studentSearchText, categoryId : vm.selectedCategory, instructorId : vm.selectedInstructor }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.orderList = response.data.data;
                            vm.totalOrders = response.data.totalCount;
                            vm.lastPage = Math.ceil(vm.totalOrders / 25) - 1;
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

        function getAllCategories() {
            $http.get(CommonInfo.getAppUrl() + "/getactivecoursecats").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.categories = response.data.data;
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

        function getAllInstructors() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { type: 3 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.instructors = response.data.data;
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
    }
})();
