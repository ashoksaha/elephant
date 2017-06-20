(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminStudentsController', AdminStudentsController);

    /** @ngInject */
    function AdminStudentsController(CommonInfo, $http, growl, $log, _, $scope) {
        var vm = this;

        vm.isCollapsed = true;
        vm.studentListTab = 1;

        vm.searchStudent = searchStudent;
        vm.getAllStudents = getAllStudents;
        vm.isStudentSelected = isStudentSelected;
        vm.addToCourse = addToCourse;

        activate();

        function activate() {
            getAllStudents(0);
            getAllCourses();
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
                    $log.log(response);
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function getAllCourses() {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: 1 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log(response);
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function isStudentSelected() {
            return _.filter(vm.students, { 'isSelected': true }).length;
        }

        function addToCourse(courseId) {
            if (courseId && isStudentSelected()) {
                var data = {
                    studentIds: _.map(_.filter(vm.students, { 'isSelected': true }), 'id'),
                    courseId: courseId,
                    addedBy: CommonInfo.getInfo('userInfo').id
                };
                $http.post(CommonInfo.getAppUrl() + "/addstudentstocourse", data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Students added to course');
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.info('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        $log.log(response);
                        growl.info('There is some issue, please try after some time');
                    }
                );
            }
        }

        function searchStudent() {

        }
    }
})();
