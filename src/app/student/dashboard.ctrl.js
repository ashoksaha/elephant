(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController(CommonInfo, $http, $log, $state, _, moment) {
        var vm = this;

        vm.courseTab = 1;
        vm.subscribedCourses = [];
        vm.invitationMail;

        vm.showCourseDetails = showCourseDetails;
        vm.sendInvitation = sendInvitation;
        vm.showCourse = showCourse;

        activate();

        function activate() {
            vm.studentInfo = CommonInfo.getInfo('studentInfo');
            if(!vm.studentInfo || !vm.studentInfo.userId){
                $state.go('main');
            }
            getSubscribedCourses();
            //getAllCourses();
        }

        function getSubscribedCourses() {
            $http.post(CommonInfo.getAppUrl() + "/getmycourses", { studentId: vm.studentInfo.userId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.subscribedCourses = _.filter(response.data.data, { 'isSubscribed': 1 });
                            vm.allCourses = _.filter(response.data.data, { 'isSubscribed': 0 });
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

        // function getAllCourses() {
        //     $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: 1 }).then(
        //         function(response) {
        //             if (response && response.data) {
        //                 if (response.data.status == 1) {
        //                     vm.allCourses = response.data.data;
        //                     _.forEach(vm.allCourses, function(value) {
        //                         value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
        //                         value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
        //                     });
        //                 } else if (response.data.status == 2) {
        //                     $log.log(response.data.message);
        //                 }
        //             } else {
        //                 $log.log('There is some issue, please try after some time');
        //             }
        //         },
        //         function(response) {
        //             $log.log('There is some issue, please try after some time');
        //         }
        //     );
        // }

        function sendInvitation() {
            if (vm.invitationMail) {
                $http.post(CommonInfo.getAppUrl() + "/sendinvite", { emails: vm.invitationMail, invitedBy: vm.studentInfo.email }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.allCourses = response.data.data;
                                _.forEach(vm.allCourses, function(value) {
                                    value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                    value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                    value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                                    value.instructor = _.find(vm.allInstructors, { 'id': value.instructorId });
                                });
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

        function showCourseDetails(course) {
            $state.go('courseDetails', { name: course.title.replace(/ /g, "-"), id: course.id });
        }

        function showCourse(course) {
            var courseDetails;
            $http.post(CommonInfo.getAppUrl() + "/getcoursedetailsbycourse_id", { courseId: course.id, studentId: vm.studentInfo.userId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            courseDetails = response.data.data[0];
                            CommonInfo.setInfo('startCourse', { unitId: courseDetails.units[0].id, courseId: courseDetails.id });
                            $state.go('startCourse', { courseName: courseDetails.title.replace(/ /g, "-") });
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
