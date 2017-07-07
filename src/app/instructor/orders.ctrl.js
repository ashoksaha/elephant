(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorOrderListController', InstructorOrderListController);

    /** @ngInject */
    function InstructorOrderListController(CommonInfo, $http, growl, $log, _, $scope, $mdDialog, $q, $timeout, $window) {
        var vm = this;

        vm.isCollapsed = true;
        vm.studentSearchText;

        vm.getAllOrders = getAllOrders;
        vm.exportOrders = exportOrders;

        activate();

        function activate() {
            vm.instructorInfo = CommonInfo.getInfo('instructorInfo');
            vm.getAllOrders(0);
        }

        function getAllOrders(page) {
            vm.currentPage = page;
            $http.post(CommonInfo.getAppUrl() + "/getinstructororders", { page: page, instructorId: vm.instructorInfo.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.orderList = response.data.data;
                            _.forEach(vm.orderList, function(value, key) {
                                value.orderDate = new Date(value.orderDate);
                            });
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

        function exportOrders() {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: event,
                scope: $scope.$new(),
                fullscreen: true,
                template: '<md-dialog aria-label="List dialog">' +
                    '<md-toolbar>' +
                    '<div class="md-toolbar-tools">' +
                    '<h2>Export</h2>' +
                    '<span flex></span>' +
                    '<md-button class="md-icon-button" ng-click="closeDialog()">' +
                    '<i class="fa fa-times" aria-hidden="true"></i>' +
                    '</md-button>' +
                    '</div>' +
                    '</md-toolbar>' +
                    '<md-dialog-content>' +
                    '<div class="md-dialog-content">' +
                    '<div layout-gt-xs="row">' +
                    '<div flex-gt-xs>' +
                    '<md-datepicker ng-model="fromDate" md-placeholder="Enter from date" md-open-on-focus></md-datepicker>' +
                    '</div>' +
                    '<div flex-gt-xs>' +
                    '<md-datepicker ng-model="toDate" md-placeholder="Enter till date" md-open-on-focus></md-datepicker>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</md-dialog-content>' +
                    '<md-dialog-actions>' +
                    '<md-button class="md-primary" lazy-load="true" ng-csv="getOrderList();" filename="order.csv" field-separator="," decimal-separator="." csv-header="exportOrderHeader();">' +
                    'Export' +
                    '</md-button>' +
                    '<md-button ng-click="closeDialog()" class="md-primary">' +
                    'Close' +
                    '</md-button>' +
                    '</md-dialog-actions>' +
                    '</md-dialog>',
                controller: DialogController
            });

            function DialogController($scope, $mdDialog, $http) {
                $scope.exportOrderHeader = function() {
                    return ["Order Id", "Order Date", "Student", "Email", "Mobile", "Amount", "Payment Gateway", "Course", "Instructor", "Status"];
                }

                $scope.closeDialog = function() {
                    $mdDialog.hide();
                }

                $scope.getOrderList = function() {
                    var deferred = $q.defer();
                    var data = {
                        fromDate: moment($scope.fromDate).format("YYYY-MM-DD"),
                        toDate: moment($scope.toDate).format("YYYY-MM-DD"),
                        instructorId: vm.instructorInfo.id
                    };

                    $http
                        .post(CommonInfo.getAppUrl() + "/downloadorders", data)
                        .success(function(data, status, headers, config) {
                            deferred.resolve(data.data);
                        });
                    $mdDialog.hide();
                    return deferred.promise;
                }
            }
        }
    }
})();
