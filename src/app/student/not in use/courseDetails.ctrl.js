(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentCourseDetailsController', StudentCourseDetailsController);

    /** @ngInject */
    function StudentCourseDetailsController(CommonInfo, $log, $http, $mdDialog, $stateParams, $scope, $state, $anchorScroll) {
        var vm = this;
        var selectedCourseId;
        var selectedCourseName;

        vm.course;

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

        vm.showInstructorCourses = showInstructorCourses;
        vm.showUnit = showUnit;
        vm.showRelatedDiscussion = showRelatedDiscussion;

        activate();

        function activate() {
            selectedCourseId = $stateParams.id;
            selectedCourseName = $stateParams.name;
            $anchorScroll();
            getCourseDetails();
        }

        function getCourseDetails() {
            $http.post(CommonInfo.getAppUrl() + "/getcoursedetailsbycourse_id", { id: selectedCourseId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            if (selectedCourseName == response.data.data[0].title.replace(/ /g, "-")) {
                                vm.course = response.data.data[0];
                                //getInstructorDetails();
                                if (vm.course.socialShare)
                                    getSocialShare();
                            }
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

        function getInstructorDetails() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { id: vm.course.instructorId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.courseInstructor = response.data.data[0];
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

        function getSocialShare() {
            $http.get(CommonInfo.getAppUrl() + "/getsocialshares").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.socialShare = _.filter(response.data.data, { 'status': 1 });
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

        function showInstructorCourses() {
            if (vm.course.instructorId) {
                $state.go('student.instructorCourses', { name: vm.course.instructorFullName.replace(/ /g, "-"), id: vm.course.instructorId })
            }
        }

        function showUnit(unit) {
            var id = selectedCourseId + ':' + unit.id;
            $state.go('student.courseUnit', { id: id, courseName: selectedCourseName, unitName: unit.name.replace(/ /g, "-") });
        }

        function showRelatedDiscussion() {
            $state.go('student.discussion', { id: selectedCourseId, name: selectedCourseName });
        }
    }
})();
