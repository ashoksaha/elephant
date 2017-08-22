(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorsController', InstructorsController);

    /** @ngInject */
    function InstructorsController(CommonInfo, $state, $http, $log, _) {
        var vm = this;

        vm.stars = [1, 2, 3, 4, 5];
        vm.instructorSearchCriteria = {
            name: ''
        };
        vm.selectedCategory = 'All Course Category';

        vm.showInstructorCourses = showInstructorCourses;

        activate();

        function activate() {
            getInstructors();
            getCourseCatgories();
        }

        function getInstructors() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { type: 3 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allInstructors = response.data.data;
                            //vm.instructorRows = _.chunk(vm.allInstructors, 3);
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

        function getCourseCatgories() {
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

        function showInstructorCourses(instructor) {
            if (instructor) {
                $state.go('instructorCourses', { name: instructor.fullName.replace(/ /g, "_") })
            }
        }
    }
})();
