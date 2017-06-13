(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('TestListController', TestListController);

    /** @ngInject */
    function TestListController(CommonInfo, $state, $http, $stateParams, $log) {
        var vm = this;
        var studentInfo;

        vm.series = {};

        vm.startTest = startTest;

        activate();

        function activate() {
            studentInfo = CommonInfo.getInfo('studentInfo');
            vm.series = {
                id: $stateParams.seriesId,
                name: $stateParams.seriesName.replace(/-/g, ' ')
            };
            showTests();
        }

        function showTests() {
            if (vm.series) {
                $http.post(CommonInfo.getTestSeriesAppUrl() + "/exam/all", { testSeriesId: vm.series.id, userId: studentInfo.userId }).then(
                    function(response) {
                        if (response && response.data) {
                            if (!response.data.Error) {
                                vm.series.testList = response.data.tests;
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

        function startTest(test) {
            if (test && test.id) {
                CommonInfo.setInfo('selectedTest', test);
                $state.go('test');
            }
        }
    }
})();
