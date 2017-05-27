(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentCourseUnitController', StudentCourseUnitController);

    /** @ngInject */
    function StudentCourseUnitController(CommonInfo, $http, $log, $state, $stateParams, $mdSidenav, $scope, $timeout, $sce, growl) {
        var vm = this;
        var selectedCourseId;
        var selectedUnitId;
        var selectedCourseName;
        var selectedUnitName;
        var studentInfo;

        vm.showReviewPage = false;

        vm.toggleLeft = buildDelayedToggler('left');
        vm.closeSide = closeSide;

        vm.getCourseUnit = getCourseUnit;
        vm.getReviewPage = getReviewPage;
        vm.submitReview = submitReview;
        vm.showRelatedDiscussion = showRelatedDiscussion

        activate();

        function activate() {
            studentInfo = CommonInfo.getInfo('studentInfo');
            var startCourse = CommonInfo.getInfo('startCourse');
            selectedCourseId = startCourse.courseId;
            selectedCourseName = $stateParams.courseName;
            selectedUnitId = startCourse.unitId;
            selectedUnitName = $stateParams.unitName;
            getUnitDetails(selectedUnitId);
            getCourseDetails();
        }

        function getUnitDetails(unitId) {
            if (studentInfo && studentInfo.name && studentInfo.email) {
                $http.post(CommonInfo.getAppUrl() + "/getunitdetailsbyunit_id", { id: unitId, userName: studentInfo.name, userEmail: studentInfo.email }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.unit = response.data.data;
                                vm.unit.unitDescription = angular.isString(vm.unit.unitDescription) ? $sce.trustAsHtml(vm.unit.unitDescription) : vm.unit.unitDescription;
                                vm.unit.videoHtml = angular.isString(vm.unit.videoHtml) ? $sce.trustAsHtml(vm.unit.videoHtml) : vm.unit.videoHtml;
                                console.log(vm.unit)
                                if (vm.unit.testId){
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
                            //getTestUserInfo(testId);
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

        function getTestUserInfo(testId) {
            var data = {
                userId: studentInfo.userId,
                testId: testId
            };
            $http.post(CommonInfo.getTestSeriesAppUrl() + '/exam/userInfo', data).then(function(response) {
                if (response && response.data && !response.data.Error) {
                    if (compareTimestamp()) {
                        vm.exam.userInfo = userInfoLocalStorage;
                    } else {
                        vm.exam.userInfo = response.data.userTestInfo;
                    }
                    if (vm.exam && vm.exam.userInfo && vm.exam.userInfo.status == 'pending' && vm.exam.userInfo.timeRemaining == 0) {
                        alert('Your exam time is over, press ok to submit exam')
                        submitExam(true);
                    } else {
                        vm.timer = vm.exam.userInfo.timeRemaining || vm.timer;
                        vm.showLangChoice = vm.exam.questions[0].questionText ? 1 : 0;
                        if (vm.showLangChoice)
                            vm.selectedLang = vm.exam.userInfo.selectedLang ? vm.exam.userInfo.selectedLang : 0;
                        else
                            vm.selectedLang = 1;
                        _.forEach(vm.exam.questions, function(value, key) {
                            vm.userCurrentQuestion[key] = _.find(vm.exam.userInfo.answers, { 'questionId': value.id }) || {
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

        function getCourseDetails() {
            $http.post(CommonInfo.getAppUrl() + "/getcoursedetailsbycourse_id", { courseId: selectedCourseId, studentId: studentInfo.userId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            if (selectedCourseName == response.data.data[0].title.replace(/ /g, "-")) {
                                vm.course = response.data.data[0];
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

        function debounce(func, wait, context) {
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
                $mdSidenav(navID)
                    .toggle();
            }, 200);
        }

        function closeSide() {
            $mdSidenav('left').close();
        }
    }
})();
