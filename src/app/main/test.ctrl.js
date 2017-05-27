(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('TestController', TestController);

    /** @ngInject */
    function TestController(CommonInfo, $state, $http) {
        var vm = this;
        var studentInfo;

        vm.currentStage = 2;
        vm.currentIndex = 0;
        vm.test = {};

        activate();

        function activate() {
            studentInfo = CommonInfo.getInfo('studentInfo');
            vm.test = CommonInfo.getInfo('selectedTest');
            if (vm.test && vm.test.id) {
                showTest();
            } else {
                $state.go('testSeries');
            }
        }

        function showTest() {
            if (vm.test) {
                $http.post(CommonInfo.getTestSeriesAppUrl() + "/exam/byId", { testId: vm.test.id }).then(
                    function(response) {
                        if (response && response.data) {
                            if (!response.data.Error) {
                                vm.test.questions = response.data.questions;
                                //getUserInfo();
                            } else {
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

        // function getUserInfo() {
        //     console.log(studentInfo.userId)
        //     if(studentInfo.userId) {
        //         $http.post(CommonInfo.getTestSeriesAppUrl() + "/exam/userInfo", { userId: studentInfo.userId }).then(
        //             function(response) {
        //                 if (response && response.data) {
        //                     if (!response.data.Error) {
        //                         vm.test.userInfo = response.data.userTestInfo;
        //                     } else {
        //                         $log.log(response.data.message);
        //                     }
        //                 } else {
        //                     $log.log('There is some issue, please try after some time');
        //                 }
        //             },
        //             function(response) {
        //                 $log.log('There is some issue, please try after some time');
        //             }
        //         );
        //     }
        // }
    }
})();
