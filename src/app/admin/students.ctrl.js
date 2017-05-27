(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminStudentsController', AdminStudentsController);

    /** @ngInject */
    function AdminStudentsController(CommonInfo, $http, growl, $log, _, $scope, $timeout) {
        var vm = this;

        vm.isCollapsed = true;
        vm.studentListTab = 1;

        vm.searchStudent = searchStudent;
        vm.getAllStudents = getAllStudents;

        activate();

        function activate() {
            getAllStudents(0);
        }

        function getAllStudents(page) {
            vm.currentPage = page;
            $http.post(CommonInfo.getAppUrl() + "/searchstudent", { page: page }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.students = response.data.data;
                            vm.totalStudents = response.data.totalCount;
                            vm.lastPage = Math.ceil(vm.totalStudents / 25) - 1;
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

        function searchStudent() {
            console.log(123);
        }
    }
})();
