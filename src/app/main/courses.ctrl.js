(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('CoursesController', CoursesController);

    /** @ngInject */
    function CoursesController(CommonInfo, $http, $state, _, $log, moment) {
        var vm = this;

        vm.allCourses = [];
        vm.allInstructors = [];
        vm.stars = [1,2,3,4,5];
        vm.courseSearchCriteria = {
            status: 1,
            name: '',
            categoryId: '',
            instructorId: ''
        };
        vm.selectedInstructor = 'All Instructors';

        vm.getAllCourses = getAllCourses;
        vm.searchCoursesByInstructor = searchCoursesByInstructor;
        vm.searchCoursesByCategory = searchCoursesByCategory;

        vm.showCourseDetails = showCourseDetails;
        vm.showAllCourses = showAllCourses;

        activate();

        function activate() {
            //var courseSearchCriteria = CommonInfo.getInfo('courseSearchCriteria');
            //vm.courseSearchCriteria = courseSearchCriteria ? courseSearchCriteria : vm.courseSearchCriteria;
            //getUnitDurations();
            getAllCategories();
            getAllInstructors();
            getAllCourses();
            getUpcommingCourses();
        }

        function getAllInstructors() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { type: 3 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allInstructors = response.data.data;
                            getAllCourses();
                            getUpcommingCourses();
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

        // function getUnitDurations() {
        //     $http.get(CommonInfo.getAppUrl() + "/getdurationparameters").then(
        //         function(response) {
        //             if (response && response.data) {
        //                 if (response.data.status == 1) {
        //                     vm.unitDurations = response.data.data;
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

        function searchCoursesByInstructor(instructor) {
            if (instructor) {
                vm.courseSearchCriteria.instructorId = instructor.id;
                vm.selectedInstructor = instructor.fullName;
            } else {
                vm.courseSearchCriteria.instructorId = '';
                vm.selectedInstructor = 'All Instructors';
            }
            getAllCourses();
        }

        function searchCoursesByCategory(categoryId) {
            vm.courseSearchCriteria.categoryId = categoryId;
            CommonInfo.setInfo('courseSearchCriteria', vm.courseSearchCriteria);
            getAllCourses();
        }

        function getAllCourses() {
            if (vm.courseSearchCriteria.categoryId || vm.courseSearchCriteria.name || vm.courseSearchCriteria.instructorId) {
                $state.go('courses.search', { query: '123' });
            } else {
                $state.go('courses.list');
            }
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", vm.courseSearchCriteria).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                //value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                                //value.instructor = _.find(vm.allInstructors, { 'id': value.instructorId });
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

        function getUpcommingCourses() {
            $http.get(CommonInfo.getAppUrl() + "/upcomingcourses").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allUpcommingCourses = response.data.data;
                            _.forEach(vm.allUpcommingCourses, function(value) {
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

        function showCourseDetails(course) {
            if (course) {
                CommonInfo.setInfo('selectedCourseId', course.id);
                CommonInfo.setInfo('courseSearchCriteria', vm.courseSearchCriteria);
                $state.go('courseDetails', { name: course.title.replace(/ /g, "-"), id: course.id });
            }
        }

        function showAllCourses() {
            $state.go('courses.search', { query: '123' });
        }
    }
})();
