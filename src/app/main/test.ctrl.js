(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('TestController', TestController);

    /** @ngInject */
    function TestController(CommonInfo, $state, $http, growl, $log, moment, _) {
        var vm = this;
        var studentInfo;
        var series;
        var submitAttempt = 0;

        vm.currentStage = 2;
        vm.currentIndex = 0;
        vm.userCurrentQuestion = [];
        vm.test = {};

        vm.submitExam = submitExam;

        activate();

        function activate() {
            studentInfo = CommonInfo.getInfo('studentInfo');
            series = CommonInfo.getInfo('selectedSeries');
            vm.test = CommonInfo.getInfo('selectedTest');
            if (vm.test && vm.test.id) {
                showTest();
            } else {
                $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
            }
        }

        function showTest() {
            if (vm.test) {
                $http.post(CommonInfo.getTestSeriesAppUrl() + "/exam/byId", { testId: vm.test.id }).then(
                    function(response) {
                        if (response && response.data) {
                            if (!response.data.Error) {
                                vm.test.questions = response.data.questions;
                                getUserTestInfo();
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

        function getUserTestInfo() {
            var data = {
                userId: studentInfo.userId,
                testId: vm.test.id
            };
            $http.post(CommonInfo.getTestSeriesAppUrl() + '/exam/userInfo', data).then(function(response) {
                if (response && response.data && !response.data.Error) {
                    vm.test.userInfo = response.data.userTestInfo;
                    if (vm.test && vm.test.userInfo && vm.test.userInfo.status == 'pending' && vm.test.userInfo.timeRemaining == 0) {
                        alert('Your exam time is over, press ok to submit exam')
                        submitExam(true);
                    } else {
                        //vm.timer = vm.exam.userInfo.timeRemaining || vm.test.duration;
                        //vm.showLangChoice = vm.exam.questions[0].questionText ? 1 : 0;
                        if (vm.showLangChoice)
                            vm.selectedLang = vm.test.userInfo.selectedLang ? vm.test.userInfo.selectedLang : 0;
                        else
                            vm.selectedLang = 1;
                        _.forEach(vm.test.questions, function(value, key) {
                            vm.userCurrentQuestion[key] = _.find(vm.test.userInfo.answers, { 'questionId': value.id }) || {
                                questionId: value.id,
                                answer: '',
                                isMarked: false
                            };
                        });
                    }
                } else {
                    growl.info('Some error occured, try after some time');
                    $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
                }
            }, function(response) {
                growl.info('Some error occured, try after some time');
                $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
            });
        }

        function submitExam(isForced, status) {
            status = status || 'completed';
            var data = {
                userId: studentInfo.userId,
                testId: vm.test.id,
                answers: vm.userCurrentQuestion,
                status: status,
                timestamp: moment(),
                selectedLang: vm.selectedLang
            };
            if (status == 'completed') {
                vm.isExamEnded = true;
            }
            if (isForced || status == 'pending' || confirm('Are you sure, you want to submit(final) your answers')) {
                $http.post(CommonInfo.getTestSeriesAppUrl() + '/exam/submit', data).then(function(response) {
                    if (response && response.data) {
                        if (status == 'completed') {
                            growl.success('Your answers saved successfully');
                            $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
                        } else {
                            if (status != 'pending') {
                                if (submitAttempt <= 3) {
                                    submitAttempt++;
                                    submitExam(true);
                                } else {
                                    growl.info('Unable to submit due to some server error, please try after some time');
                                    $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
                                }
                            }
                        }
                    }
                }, function(response) {
                    if (status != 'pending') {
                        if (submitAttempt <= 3) {
                            submitAttempt++;
                            submitExam(true);
                        } else {
                            growl.info('Unable to submit due to some server error, please try after some time');
                            $state.go('testList', { seriesName: series.name.replace(/ /g, '-'), seriesId: series.id });
                        }
                    }
                });
            }
        }
    }
})();
