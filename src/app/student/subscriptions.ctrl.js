(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentSubscriptionsController', StudentSubscriptionsController);

    /** @ngInject */
    function StudentSubscriptionsController(CommonInfo, $log, $http, $stateParams, growl, $state, _) {
        var vm = this;
        var studentInfo;

        vm.showCourseDetails = showCourseDetails;

        activate();

        function activate() {
            studentInfo = CommonInfo.getInfo('studentInfo');
            if(!studentInfo || !studentInfo.userId){
                $state.go('main');
            }
            getAllOrders();
        }

        function getAllOrders() {
            $http.post(CommonInfo.getAppUrl() + "/getordersby_studentid", { studentId: studentInfo.userId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.orders = response.data.data;
                            _.forEach(vm.orders, function(value, key){
                                value.orderDate = new Date(value.orderDate);
                            });
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.info('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.info('There is some issue, please try after some time');
                }
            );
        }

        function showCourseDetails(courseName, courseId) {
            if (courseName && courseId) {
                $state.go('courseDetails', { name: courseName.replace(/ /g, "-"), id: courseId });
            }
        }
    }
})();
