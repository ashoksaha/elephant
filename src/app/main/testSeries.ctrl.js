(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('TestSeriesController', TestSeriesController);

    /** @ngInject */
    function TestSeriesController(CommonInfo, $state, $http) {
        var vm = this;

        vm.showTests = showTests;

        activate();

        function activate() {
            getAllTestSeries();
        }

        function getAllTestSeries() {
            $http.get(CommonInfo.getTestSeriesAppUrl() + "/testSeries/all").then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.testSeriesList = response.data.testSeries;
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

        function showTests(series) {
            if (series) {
                $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
            }
        }
    }
})();
