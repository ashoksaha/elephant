(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminLMSController', AdminLMSController);

    /** @ngInject */
    function AdminLMSController(CommonInfo, $state, $log, $http, growl, _, moment, Upload) {
        var vm = this;

        vm.lmsTab = 1;
        vm.categoryListTab = 1;
        vm.userInfo = CommonInfo.getInfo('userInfo');
        vm.searchUnit = {
            name: ''
        };
        vm.activeCourseCategories = [];
        vm.inactiveCourseCategories = [];
        vm.activeUnits = [];
        vm.allUnits = [];
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
            courseFee: '',
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

        vm.getCoursesByCategoryId = getCoursesByCategoryId;
        vm.getUnitsByCourseId = getUnitsByCourseId;
        vm.getCourseStudents = getCourseStudents;
        vm.getCourseCallrequests = getCourseCallrequests;
        vm.getCoursesReview = getCoursesReview;
        vm.updateCourseReview = updateCourseReview;
        vm.getLmsSettings = getLmsSettings;
        vm.updateSocialShares = updateSocialShares;

        vm.searchCourses = searchCourses;
        vm.searchActiveCourses = searchActiveCourses;
        vm.searchInactiveCourses = searchInactiveCourses;
        vm.searchUnits = searchUnits;

        activate();

        function activate() {
            if ($state.current.name == 'admin.lms.courses')
                vm.lmsTab = 1;
            else if ($state.current.name == 'admin.lms.courseCategories')
                vm.lmsTab = 2;
            else if ($state.current.name == 'admin.lms.units')
                vm.lmsTab = 3;
            else if ($state.current.name == 'admin.lms.callrequest')
                getCourseCallrequests();
            else if ($state.current.name == 'admin.lms.coursesReview')
                getCoursesReview();
            else if ($state.current.name == 'admin.lms.setting')
                getLmsSettings();
            getInstructor();
            getCategories();
            getUnitTypes();
            getUnitDurations();
        }

        function getCategories() {
            getActiveCategories();
            getInactiveCategories();
        }

        function getInstructor() {
            $http.post(CommonInfo.getAppUrl() + "/getallusers", { type: 3 }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allInstructors = response.data.data;
                            getAllCourses();
                        } else if (response.data.status == 2) {
                            $log.log(response.data.message);
                        }
                    } else {
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log(response);
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function getAllCourses() {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.allCourses = response.data.data;
                            _.forEach(vm.allCourses, function(value) {
                                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                                //value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                                //value.instructor = _.find(vm.allInstructors, { 'id': value.instructorId });
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
                    $log.log(response);
                    $log.log('There is some issue, please try after some time');
                }
            );
        }

        function getUnits() {
            $http.get(CommonInfo.getAppUrl() + "/getcourseunits").then(
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
                    $log.log(response);
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
                    $log.log(response);
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
                        $log.log(response);
                        $log.log('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    $log.log(response);
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
                        $log.log(response);
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
                            $log.log(response);
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
                            $state.go('admin.lms.courseCategories')
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
            $state.go('admin.lms.editCategory');
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
            vm.unit.addedBy = vm.userInfo.id;
            vm.unit.downloadLink = angular.toJson(vm.unit.downloadLink);
            $http.post(CommonInfo.getAppUrl() + api, vm.unit).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            getUnits();
                            vm.unit = {};
                            vm.lmsTab = 3;
                            growl.success(msg);
                            $state.go('admin.lms.units')
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
            if(angular.isString(vm.unit.downloadLink))
                vm.unit.downloadLink = JSON.parse(vm.unit.downloadLink);
            $state.go('admin.lms.editUnit');
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
            vm.course.addedBy = vm.userInfo.id;
            if(vm.course.freeCourse == 1)
                vm.course.courseFee = 0;
            $http.post(CommonInfo.getAppUrl() + api, vm.course).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            getAllCourses();
                            vm.course = {};
                            vm.lmsTab = 1;
                            growl.success(msg);
                            $state.go('admin.lms.courses')
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
            $state.go('admin.lms.editCourse');
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
                    status: status
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

        function searchActiveCourses(){
            searchCourses(1, vm.activeCourseSearchText, vm.activeSelectedCategory, vm.activeSelectedInstructor);
        }

        function searchInactiveCourses(){
            searchCourses(0, vm.inactiveCourseSearchText, vm.inactiveSelectedCategory, vm.inactiveSelectedInstructor);
        }

        function searchCourses(status, courseName, categoryId, instructorId) {
            $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: status, name: courseName, categoryId: categoryId, instructorId: instructorId }).then(
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
                            $state.go('admin.lms.students');
                            vm.studentsByCourse = response.data.data;

                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
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

        function getCourseCallrequests() {
            vm.lmsTab = 4;
            $http.get(CommonInfo.getAppUrl() + "/getallcallbacks").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            $state.go('admin.lms.callrequest');
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

        function getCoursesReview() {
            vm.lmsTab = 5;
            $http.post(CommonInfo.getAppUrl() + "/searchreviews", {}).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            $state.go('admin.lms.coursesReview');
                            vm.coursesReview = response.data.data;
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

        function updateCourseReview(review) {
            var data = angular.copy(review);
            data.status = data.status ? 0 : 1;
            $http.post(CommonInfo.getAppUrl() + "/createupdatereview", data).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            growl.success('Review updated successfuly');
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

        function getLmsSettings() {
            vm.lmsTab = 6;
            getSocialShares();
        }

        function getSocialShares() {
            $http.get(CommonInfo.getAppUrl() + "/getsocialshares").then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            $state.go('admin.lms.setting');
                            vm.socialShare = response.data.data;
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

        function updateSocialShares() {
            $http.post(CommonInfo.getAppUrl() + "/updatesocialshares", vm.socialShare).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            growl.success('Social sharing  updated successfuly');
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
})();
