(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorCoursesController', InstructorCoursesController);

    /** @ngInject */
    function InstructorCoursesController(CommonInfo, $log, $http, $mdDialog, $stateParams, $scope, $state, $anchorScroll, growl) {
        var vm = this;
        var selectedInstructorId;
        
        vm.selectedInstructorName;
        vm.stars = [1,2,3,4,5];

        activate();

        function activate() {
            selectedInstructorId = $stateParams.id;
            vm.selectedInstructorName = $stateParams.name.replace(/-/g, " ");
            $anchorScroll();
            getCourses();
        }

        function getCourses() {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { instructorId: selectedInstructorId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
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
})();
