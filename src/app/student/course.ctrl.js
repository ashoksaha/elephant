(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentCourseUnitController', StudentCourseUnitController);

    /** @ngInject */
    function StudentCourseUnitController(CommonInfo, $http, $log, $state, $stateParams, $mdSidenav, $scope, $timeout, $sce, growl, _, moment, $window) {
        var vm = this;
        var selectedCourseId;
        var selectedUnitId;
        var selectedCourseName;
        var studentInfo;
        var submitAttempt;
        //var selectedUnitName;

        vm.showReviewPage = false;
        vm.userCurrentQuestion = [];
        vm.isLeftOpen = false;

        vm.toggleLeft = buildDelayedToggler('left');
        vm.closeSide = closeSide;

        vm.getCourseUnit = getCourseUnit;
        vm.getReviewPage = getReviewPage;
        vm.submitReview = submitReview;
        vm.showRelatedDiscussion = showRelatedDiscussion
        vm.submitExam = submitExam;

        activate();

        function activate() {
            studentInfo = CommonInfo.getInfo('studentInfo');
            if(!studentInfo || !studentInfo.userId){
                $state.go('main');
            }
            var startCourse = CommonInfo.getInfo('startCourse');
            selectedCourseId = startCourse.courseId;
            selectedCourseName = $stateParams.courseName;
            selectedUnitId = startCourse.unitId;
            //selectedUnitName = $stateParams.unitName;
            getUnitDetails(selectedUnitId);
            getCourseDetails();
        }

        function getUnitDetails(unitId) {
            $window.scrollTo(0, 0);
            if (studentInfo && studentInfo.name && studentInfo.email) {
                CommonInfo.setInfo('startCourse', { unitId: unitId, courseId: selectedCourseId });
                $http.post(CommonInfo.getAppUrl() + "/getunitdetailsbyunit_id", { id: unitId, userName: studentInfo.name, userEmail: studentInfo.email }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.unit = response.data.data;
                                vm.unit.unitDescription = angular.isString(vm.unit.unitDescription) ? $sce.trustAsHtml(vm.unit.unitDescription) : vm.unit.unitDescription;
                                vm.unit.videoHtml = angular.isString(vm.unit.videoHtml) ? $sce.trustAsHtml(vm.unit.videoHtml) : vm.unit.videoHtml;
                                if (angular.isString(vm.unit.downloadLink))
                                    vm.unit.downloadLink = JSON.parse(vm.unit.downloadLink);
                                if (vm.unit.testId) {
                                    getTest(vm.unit.testId);
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
                // vm.unit = _.filter(vm.course.units, { 'id', unitId });
                // vm.unit.unitDescription = angular.isString(vm.unit.unitDescription) ? $sce.trustAsHtml(vm.unit.unitDescription) : vm.unit.unitDescription;
                // vm.unit.videoHtml = angular.isString(vm.unit.videoHtml) ? $sce.trustAsHtml(vm.unit.videoHtml) : vm.unit.videoHtml;
                // if (angular.isString(vm.unit.downloadLink))
                //     vm.unit.downloadLink = JSON.parse(vm.unit.downloadLink);
                // if (vm.unit.testId) {
                //     getTest(vm.unit.testId);
                // }
            }
        }

        function getTest(testId) {
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/test/byId", { testId: testId }).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.unit.test = response.data.test;
                            getTestQuestions(testId);
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

        function getTestQuestions(testId) {
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/exam/byId", { testId: testId }).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.unit.test.questions = response.data.questions;
                            getUserTestInfo();
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

        function getUserTestInfo() {
            var data = {
                userId: studentInfo.userId,
                testId: vm.unit.test.id
            };
            $http.post(CommonInfo.getTestSeriesAppUrl() + '/exam/userInfo', data).then(function(response) {
                if (response && response.data && !response.data.Error) {
                    vm.unit.test.userInfo = response.data.userTestInfo;
                    if (vm.unit.test && vm.unit.test.userInfo && vm.unit.test.userInfo.status == 'pending' && vm.unit.test.userInfo.timeRemaining == 0) {
                        alert('Your exam time is over, press ok to submit exam')
                        submitExam(true);
                    } else {
                        //vm.timer = vm.exam.userInfo.timeRemaining || vm.test.duration;
                        //vm.showLangChoice = vm.exam.questions[0].questionText ? 1 : 0;
                        if (vm.showLangChoice)
                            vm.selectedLang = vm.unit.test.userInfo.selectedLang ? vm.unit.test.userInfo.selectedLang : 0;
                        else
                            vm.selectedLang = 1;
                        _.forEach(vm.unit.test.questions, function(value, key) {
                            vm.userCurrentQuestion[key] = _.find(vm.unit.test.userInfo.answers, { 'questionId': value.id }) || {
                                questionId: value.id,
                                answer: '',
                                isMarked: false
                            };
                        });
                    }
                } else {
                    growl.info('Some error occured, try after some time');
                }
            }, function(response) {
                growl.info('Some error occured, try after some time');
            });
        }

        function submitExam(isForced, status) {
            status = status || 'completed';
            var data = {
                userId: studentInfo.userId,
                testId: vm.unit.test.id,
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
                        } else {
                            if (status != 'pending') {
                                if (submitAttempt <= 3) {
                                    submitAttempt++;
                                    submitExam(true);
                                } else {
                                    growl.info('Unable to submit due to some server error, please try after some time');
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
                        }
                    }
                });
            }
        }

        function getCourseDetails() {
            $http.post(CommonInfo.getAppUrl() + "/getcoursedetailsbycourse_id", { courseId: selectedCourseId, studentId: studentInfo.userId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            if (selectedCourseName == response.data.data[0].title.replace(/ /g, "-")) {
                                vm.course = response.data.data[0];
                                if(vm.course && vm.course.courseCurriculum && vm.course.units.length > 0) {
                                    var units = [];
                                    var unitIds = vm.course.courseCurriculum.split(',');
                                    _.forEach(unitIds, function(value, key){
                                        units.push(_.find(vm.course.units, { 'id': parseInt(value) }));
                                    });
                                    vm.course.units = units;
                                }
                                vm.review = {
                                    reviewRating: vm.course.reviewRating,
                                    reviewTitle: vm.course.reviewTitle,
                                    reviewDetails: vm.course.reviewDetails
                                };
                            }
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                            $state.go('dashboard');
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

        function getCourseUnit(unit) {
            closeSide();
            vm.showReviewPage = false;
            var id = selectedCourseId + ':' + unit.id;
            $state.transitionTo('startCourse', { id: id, courseName: selectedCourseName, unitName: unit.name.replace(/ /g, "-") }, { notify: false });
            getUnitDetails(unit.id);
        }

        function getReviewPage() {
            closeSide();
            vm.showReviewPage = true;
            vm.unit.name = "Course Review";
        }

        function submitReview() {
            if (vm.review.reviewRating && vm.review.reviewTitle) {
                vm.review.courseId = selectedCourseId;
                vm.review.studentId = studentInfo.userId;
                $http.post(CommonInfo.getAppUrl() + "/createupdatereview", vm.review).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Review submited successfuly');
                            } else if (response.data.status == 2) {
                                growl.log(response.data.message);
                            }
                        } else {
                            growl.log('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.log('There is some issue, please try after some time');
                    }
                );
            }
        }

        function showRelatedDiscussion() {
            $state.go('discussions', { id: selectedCourseId, name: selectedCourseName });
        }

        function debounce(func, wait) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        function buildDelayedToggler(navID) {
            return debounce(function() {
                vm.isLeftOpen = true;
                $mdSidenav(navID)
                    .toggle();
            }, 200);
        }

        function closeSide() {
            vm.isLeftOpen = false;
            $mdSidenav('left').close();
        }
    }
})();
