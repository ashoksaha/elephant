(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorLMSController', InstructorLMSController);

    /** @ngInject */
    function InstructorLMSController(CommonInfo, $state, $log, $http, growl, _, moment, Upload, $mdDialog, $scope) {
        var vm = this;

        vm.lmsTab = 1;
        vm.categoryListTab = 1;
        vm.instructorInfo = {};
        vm.searchUnit = {
            name: ''
        };
        vm.activeCourseCategories = [];
        vm.inactiveCourseCategories = [];
        vm.activeUnits = [];
        vm.allUnits = [];
        vm.selectedTest = [];
        vm.toolBar = [
            ['h1', 'h2', 'h3', 'bold', 'italics', 'underline'],
            ['ol', 'ul'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['html', 'insertImage', 'insertLink', 'insertVideo']
        ];
        vm.category = {
            id: '',
            name: '',
            description: '',
            parentId: '',
            image: '',
            status: 0,
            isDeleted: 0
        };
        vm.unit = {
            id: '',
            name: '',
            description: '',
            unitDescription: '',
            image: '',
            unitType: '',
            freeUnit: 0,
            duration: '',
            durationParameter: '',
            relatedForum: '',
            connectedAssignments: '',
            allowComment: 0,
            instructorId: '',
            addedBy: ''
        };
        vm.course = {
            id: '',
            courseCategoryId: '',
            title: '',
            image: '',
            description: '',
            courseFee: 0,
            duration: '',
            durationParameter: '',
            totalStudents: '',
            courseReviews: '',
            courseStartDate: '',
            courseEndDate: '',
            maxStudents: '',
            courseCurriculum: '',
            courseRetakes: '',
            instructions: '',
            completionMessage: '',
            freeCourse: '',
            allowComments: '',
            instructorId: '',
            status: 0,
            isDeleted: 0
        };

        vm.createCourseCategory = createCourseCategory;
        vm.editCategory = editCategory;
        vm.createUnit = createUnit;
        vm.editUnit = editUnit;
        vm.createCourse = createCourse;
        vm.editCourse = editCourse;
        vm.addTest = addTest;
        vm.editTest = editTest;
        vm.addNewQP = addNewQP;
        vm.editQuestionPaper = editQuestionPaper;
        vm.importQuestionDoc = importQuestionDoc;
        vm.addtestSeries = addtestSeries;
        vm.editTestSeries = editTestSeries;

        vm.getCoursesByCategoryId = getCoursesByCategoryId;
        vm.getUnitsByCourseId = getUnitsByCourseId;
        vm.getCourseStudents = getCourseStudents;
        vm.getSeriesTest = getSeriesTest;
        vm.getCourseCallrequests = getCourseCallrequests;

        vm.searchCourses = searchCourses;
        vm.searchUnits = searchUnits;

        vm.toggleSelectedTest = toggleSelectedTest;
        vm.addToTestSeries = addToTestSeries;

        vm.importCancel = importCancel;
        vm.addQuestion = addQuestion;

        activate();

        function activate() {
            vm.instructorInfo = CommonInfo.getInfo('instructorInfo');
            if ($state.current.name == 'instructor.lms.courses')
                vm.lmsTab = 1;
            else if ($state.current.name == 'instructor.lms.courseCategories')
                vm.lmsTab = 2;
            else if ($state.current.name == 'instructor.lms.units')
                vm.lmsTab = 3;
            else if ($state.current.name == 'instructor.lms.tests')
                vm.lmsTab = 4;
            else if ($state.current.name == 'instructor.lms.students') {
                vm.lmsTab = 1;
                getCourseStudents(CommonInfo.getInfo('selectedCourse'));
            } else if ($state.current.name == 'instructor.lms.callrequest') {
                vm.lmsTab = 1;
                var selectedCourse = CommonInfo.getInfo('selectedCourse');
                if (selectedCourse)
                    getCourseCallrequests(selectedCourse);
                else
                    $state.go('instructor.lms.courses');
            }
            getCoursesByInstructor();
            getCategories();
            getUnitTypes();
            getUnitDurations();
            getAllTests();
            getAllQuestionPapers();
            getAllTestseries();
        }

        function getCategories() {
            getActiveCategories();
            getInactiveCategories();
        }

        function getCoursesByInstructor() {
            $http.post(CommonInfo.getAppUrl() + "/getallcoursesby_Inst_Id", { id: vm.instructorInfo.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                            });
                            vm.coursesList = vm.activeCourses = _.filter(vm.allCourses, { 'status': 1 });
                            vm.inactiveCourses = _.filter(vm.allCourses, { 'status': 0 });
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

        function getUnits() {
            $http.post(CommonInfo.getAppUrl() + "/getcourseunitsby_Inst_Id", { id: vm.instructorInfo.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allUnits = response.data.data;
                            _.forEach(vm.allUnits, function(value) {
                                value.unitTypeName = _.map(_.filter(vm.unitTypes, { 'id': value.unitType }), 'name')[0];
                            });
                            vm.activeUnits = _.filter(vm.allUnits, { 'status': 1 });
                            vm.inactiveUnits = _.filter(vm.allUnits, { 'status': 0 });
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

        function getActiveCategories() {
            $http.get(CommonInfo.getAppUrl() + "/getactivecoursecats").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.activeCourseCategories = response.data.data;
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

        function getInactiveCategories() {
            $http.get(CommonInfo.getAppUrl() + "/getinactivecoursecats").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.inactiveCourseCategories = response.data.data;
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

        function getUnitTypes() {
            $http.get(CommonInfo.getAppUrl() + "/getunittypes").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.unitTypes = response.data.data;
                            getUnits();
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

        function getUnitDurations() {
            $http.get(CommonInfo.getAppUrl() + "/getdurationparameters").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.unitDurations = response.data.data;
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

        function createCourseCategory(file) {
            if (!file || angular.isString(file)) {
                addUpdateCourseCategory();
            } else {
                Upload.base64DataUrl(file).then(function(url) {
                    vm.category.image = url;
                    addUpdateCourseCategory();
                });
            }
        }

        function addUpdateCourseCategory() {
            var api = "/createcoursecat";
            var msg = 'Category added successfuly';
            if (vm.category.id) {
                api = "/updatecoursecat";
                msg = 'Category edited successfuly';
            }
            $http.post(CommonInfo.getAppUrl() + api, vm.category).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            getCategories();
                            vm.category = {};
                            vm.lmsTab = 2;
                            growl.success(msg);
                            $state.go('instructor.lms.courseCategories')
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.info('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.warning('There is some issue, please try after some time');
                }
            );
        }

        function editCategory(category) {
            vm.category = category;
            $state.go('instructor.lms.createCategories');
        }

        function createUnit(file) {
            if (!file || angular.isString(file)) {
                addUpdateUnit();
            } else {
                Upload.base64DataUrl(file).then(function(url) {
                    vm.unit.image = url;
                    addUpdateUnit();
                });
            }
        }

        function addUpdateUnit() {
            var api = "/createcourseunit";
            var msg = 'Unit added successfuly';
            if (vm.unit.id) {
                api = "/updatecourseunit";
                msg = 'Unit edited successfuly';
            }
            vm.unit.addedBy = vm.unit.instructorId = vm.instructorInfo.id;
            $http.post(CommonInfo.getAppUrl() + api, vm.unit).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            getUnits();
                            vm.unit = {};
                            vm.lmsTab = 3;
                            growl.success(msg);
                            $state.go('instructor.lms.units')
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.info('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.warning('There is some issue, please try after some time');
                }
            );
        }

        function editUnit(unit) {
            vm.unit = angular.merge({}, vm.unit, unit);
            $state.go('instructor.lms.createUnit');
        }

        function createCourse(file) {
            if (!file || angular.isString(file)) {
                addUpdateCourse();
            } else {
                Upload.base64DataUrl(file).then(function(url) {
                    vm.course.image = url;
                    addUpdateCourse();
                });
            }
        }

        function addUpdateCourse() {
            var api = "/createcourse";
            var msg = 'Course added successfuly';
            if (vm.course.id) {
                api = "/updatecourse";
                msg = 'Course edited successfuly';
            }
            vm.course.courseCurriculum = _.compact(vm.course.courseCurriculum).join(',');
            vm.course.instructorId = vm.instructorInfo.id;
            $http.post(CommonInfo.getAppUrl() + api, vm.course).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            getCoursesByInstructor();
                            vm.course = {};
                            vm.lmsTab = 1;
                            growl.success(msg);
                            $state.go('instructor.lms.courses')
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.info('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.warning('There is some issue, please try after some time');
                }
            );
        }

        function editCourse(course) {
            vm.course = angular.merge({}, vm.course, course);
            vm.course.courseCurriculum = _.split(vm.course.courseCurriculum, ',');
            $state.go('instructor.lms.createCourses');
        }

        function getCoursesByCategoryId(status, categoryId) {
            if (categoryId === null) {
                $http.post(CommonInfo.getAppUrl() + "/getallcoursesby_Inst_Id", { id: vm.instructorInfo.id }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.allCourses = response.data.data;
                                _.forEach(vm.allCourses, function(value) {
                                    value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                    value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                    value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                                });
                                if (status == 1)
                                    vm.activeCourses = _.filter(vm.allCourses, { 'status': 1 });
                                else
                                    vm.inactiveCourses = _.filter(vm.allCourses, { 'status': 0 });
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
            } else {
                var data = {
                    id: categoryId,
                    status: status,
                    instructorId: vm.instructorInfo.id
                };
                $http.post(CommonInfo.getAppUrl() + '/getcourseslistbycat_id', data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                _.forEach(response.data.data, function(value) {
                                    value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                    value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                });
                                if (status == 1) {
                                    vm.activeCourses = response.data.data;
                                } else {
                                    vm.inactiveCourses = response.data.data;
                                }
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.info('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }

        function getUnitsByCourseId(status, courseId) {
            var units = {};
            if (courseId === null) {
                $http.post(CommonInfo.getAppUrl() + "/getcourseunitsby_Inst_Id", { id: vm.instructorInfo.id }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                units = response.data.data;
                                _.forEach(units, function(value) {
                                    value.unitTypeName = _.map(_.filter(vm.unitTypes, { 'id': value.unitType }), 'name')[0];
                                });
                                if (status == 1)
                                    vm.activeUnits = _.filter(units, { 'status': 1 });
                                else
                                    vm.inactiveUnits = _.filter(units, { 'status': 0 });
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
            } else {
                var data = {
                    id: courseId,
                    status: status,
                    instructorId: vm.instructorInfo.id
                };
                $http.post(CommonInfo.getAppUrl() + '/getunitslistbycourse_id', data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                units = response.data.data;
                                _.forEach(units, function(value) {
                                    value.unitTypeName = _.map(_.filter(response.data.data, { 'id': value.unitType }), 'name')[0];
                                });
                                if (status == 1) {
                                    vm.activeUnits = response.data.data;
                                } else {
                                    vm.inactiveUnits = response.data.data;
                                }
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            }
                        } else {
                            growl.info('There is some issue, please try after some time');
                        }
                    },
                    function(response) {
                        growl.warning('There is some issue, please try after some time');
                    }
                );
            }
        }

        function searchUnits(status, unitName) {
            var units = {};
            $http.post(CommonInfo.getAppUrl() + "/searchunit", { status: status, name: unitName, instructorId: vm.instructorInfo.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            units = response.data.data;
                            _.forEach(units, function(value) {
                                value.unitTypeName = _.map(_.filter(vm.unitTypes, { 'id': value.unitType }), 'name')[0];
                            });
                            if (status == 1)
                                vm.activeUnits = _.filter(units, { 'status': 1 });
                            else
                                vm.inactiveUnits = _.filter(units, { 'status': 0 });
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

        function searchCourses(status, courseName, categoryId) {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: status, name: courseName, categoryId: categoryId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                            });
                            if (status == 1)
                                vm.activeCourses = _.filter(vm.allCourses, { 'status': 1 });
                            else
                                vm.inactiveCourses = _.filter(vm.allCourses, { 'status': 0 });
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

        function getCourseStudents(course) {
            vm.selectedCourse = course;
            CommonInfo.setInfo('selectedCourse', vm.selectedCourse);
            $http.post(CommonInfo.getAppUrl() + "/getstudentsenrolled", { courseId: course.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            $state.go('instructor.lms.students');
                            vm.studentsByCourse = response.data.data;

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

        function getCourseCallrequests(course) {
            CommonInfo.setInfo('selectedCourse', course);
            $http.post(CommonInfo.getAppUrl() + "/getcourserequest_by_course_id", { id: course.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            $state.go('instructor.lms.callrequest');
                            vm.callrequestsByCourse = response.data.data;

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

        function getAllTests() {
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/test/byInstructor", { instructorId: vm.instructorInfo.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.tests = response.data.tests;
                            console.log(vm.tests)
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

        function getAllQuestionPapers() {
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/questionPaper/byInstructor", { instructorId: vm.instructorInfo.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.questionPapers = response.data.questionPapers;
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

        function getAllTestseries() {
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/testSeries/byInstructor", { instructorId: vm.instructorInfo.id }).then(
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

        function addTest() {
            vm.test.instructorId = vm.instructorInfo.id;
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/test", vm.test).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            getAllTests();
                            $state.go('instructor.lms.tests')
                            growl.success('Test added successfuly');
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

        function editTest(test) {
            vm.test = test;
            vm.test.duration = vm.test.durationInHrs;
            $state.go('instructor.lms.createTest');
        }

        function addNewQP(evt) {
            var confirm = $mdDialog.prompt()
                .title('Enter Question Paper Name')
                .placeholder('Name')
                .ariaLabel('question paper name')
                .targetEvent(evt)
                .ok('Save')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
                $http.post(CommonInfo.getTestSeriesAppUrl() + "/questionPaper", { 'name': result, instructorId: vm.instructorInfo.id }).then(
                    function(response) {
                        if (response && response.data) {
                            if (!response.data.Error) {
                                getAllQuestionPapers();
                                growl.success('Question paper added successfuly');
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
            }, function() {

            });
        }

        function editQuestionPaper(evt, questionPaper) {
            var confirm = $mdDialog.prompt()
                .title('Enter Question Paper Name')
                .placeholder('Name')
                .initialValue(questionPaper.name)
                .ariaLabel('question paper name')
                .targetEvent(evt)
                .ok('Save')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
                $http.post(CommonInfo.getTestSeriesAppUrl() + "/questionPaper", { 'name': result, 'id': questionPaper.id, instructorId: vm.instructorInfo.id }).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.questionPapers = response.data.questionPapers;
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
            }, function() {

            });
        }

        function importQuestionDoc(file, quesPaperId) {
            if (vm.question.file) {
                Upload.upload({
                    url: CommonInfo.getTestSeriesAppUrl() + '/question/importDoc',
                    data: {
                        file: vm.question.file,
                        questionPaperId: quesPaperId
                    }
                }).then(function(resp) {
                    if (resp && resp.data && resp.data.result && resp.data.result.questions && resp.data.result.questions.length > 0) {
                        vm.importQuestions = {
                            questions: resp.data.result.questions,
                            quesPaperId: resp.data.result.questionPaperId
                        }
                        $mdDialog.show({
                                scope: $scope.$new(),
                                templateUrl: 'app/instructor/questions.tmpl.html',
                                parent: angular.element(document.body)
                            })
                            .then(function(answer) {
                                $scope.status = 'You said the information was "' + answer + '".';
                            }, function() {
                                $scope.status = 'You cancelled the dialog.';
                            });
                    }
                }, function(resp) {
                    console.log('Error status: ' + resp.status);
                }, function(evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
        }

        function importCancel() {
            $mdDialog.cancel();
        }

        function addQuestion() {
            var data = {
                questions: vm.importQuestions.questions,
                questionPaperId: vm.importQuestions.quesPaperId
            };
            $http.post(CommonInfo.getTestSeriesAppUrl() + '/question/add', data).then(function(response) {
                if (response && response.data && !response.data.Error) {
                    $mdDialog.cancel();
                    growl.success('Questions added successfully');
                    getAllquestionPapers();
                }
            }, function(response) {});
        }

        function addtestSeries() {
            vm.testSeries.instructorId = vm.testSeries.createdBy = vm.instructorInfo.id;
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/testSeries", vm.testSeries).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            getAllTestseries();
                            $state.go('instructor.lms.tests')
                            growl.success('Test added successfuly');
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

        function editTestSeries(series) {
            vm.testSeries = series;
            $state.go('instructor.lms.createTestSeries');
        }

        function toggleSelectedTest(testId) {
            var index = vm.selectedTest.indexOf(testId);
            if (index > -1) {
                vm.selectedTest.splice(index, 1);
            } else {
                vm.selectedTest.push(testId);
            }
            console.log(vm.selectedTest)
        }

        function addToTestSeries(seriesId) {
            if (seriesId) {
                var data = {
                    testSeriesId: seriesId,
                    tests: _.filter(vm.tests, { 'isSelected': true })
                };
                $http.post(CommonInfo.getTestSeriesAppUrl() + "/testSeries/addTest", data).then(
                    function(response) {
                        if (response && response.data) {
                            if (!response.data.Error) {
                                getAllTestseries();
                                _.forEach(vm.tests, function(value) {
                                    value.isSelected = false;
                                });
                                growl.success('Test added successfuly');
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

        function getSeriesTest(series) {
            vm.selectedSeries = series;
            $http.post(CommonInfo.getTestSeriesAppUrl() + "/testSeries/getTests", { testSeriesId: series.id }).then(
                function(response) {
                    if (response && response.data) {
                        if (!response.data.Error) {
                            vm.selectedSeries.tests = response.data.tests;
                            $state.go('instructor.lms.testSeriesTest');
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
