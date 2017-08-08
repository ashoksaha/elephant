(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('AdminLMSController', AdminLMSController);

  /** @ngInject */
  function AdminLMSController(CommonInfo, $state, $log, $http, growl, _, moment, Upload, $mdDialog, $scope, $q) {
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
    vm.toolBar = [
      ['h1', 'h2', 'h3', 'bold', 'italics', 'underline'],
      ['ol', 'ul'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
      ['html', 'insertImage', 'insertLink', 'insertVideo']
    ];

    vm.createCourseCategory = createCourseCategory;
    vm.editCategory = editCategory;
    vm.createUnit = createUnit;
    vm.editUnit = editUnit;
    vm.createCourse = createCourse;
    vm.editCourse = editCourse;
    vm.previewCourse = previewCourse;

    //vm.getCoursesByCategoryId = getCoursesByCategoryId;
    vm.getUnitsByCourseId = getUnitsByCourseId;
    vm.getCourseStudents = getCourseStudents;
    vm.exportCourseStudents = exportCourseStudents;
    vm.showCourseStudents = showCourseStudents;
    vm.editStudentSubscription = editStudentSubscription;
    vm.getCourseCallrequests = getCourseCallrequests;
    vm.getCoursesReview = getCoursesReview;
    vm.updateCourseReview = updateCourseReview;
    vm.getLmsSettings = getLmsSettings;
    vm.updateSocialShares = updateSocialShares;
    vm.getCoupons = getCoupons;
    vm.addCoupon = addCoupon;

    vm.searchCourses = searchCourses;
    vm.searchActiveCourses = searchActiveCourses;
    vm.searchInactiveCourses = searchInactiveCourses;
    vm.searchUnits = searchUnits;

    vm.addReview = addReview;
    vm.addCommentToCall = addCommentToCall;

    vm.checkUnit = checkUnit;

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
      else if ($state.current.name == 'admin.lms.students')
        showCourseStudents();
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
      $http.post(CommonInfo.getAppUrl() + "/searchcourses", { isForsale: '' }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.allCourses = response.data.data;
              _.forEach(vm.allCourses, function(value) {
                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                value.categories = _.reject(vm.activeCourseCategories, function(o) {
                  return _.indexOf(value.courseCategories, o.id) == -1;
                });
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
      if (angular.isString(vm.unit.downloadLink))
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
      var categories;
      if (vm.course.id) {
        api = "/updatecourse";
        msg = 'Course edited successfuly';
        categories = _.xor(vm.course.categories, vm.course.courseCategories);
        vm.course.isCategoryChanged = categories.length > 0 ? true : false;
      }
      vm.course.title = vm.course.title.substr(0, 50);
      vm.course.courseCurriculum = _.map(vm.course.oldUnits, 'id');
      if (vm.course.courseCurriculum && vm.course.courseCurriculum.length)
        vm.course.courseCurriculum = _.compact(vm.course.courseCurriculum).join(',');
      vm.course.addedBy = vm.userInfo.id;
      if (vm.course.freeCourse == 1)
        vm.course.courseFee = 0;
      vm.course.newUnits = _.map(vm.course.addUnits, 'id');
      if (vm.course.newUnits && vm.course.newUnits.length)
        vm.course.newUnits = _.compact(vm.course.newUnits).join(',');
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
      var unitIds = _.split(vm.course.courseCurriculum, ',');
      var units = [];
      _.forEach(unitIds, function(value, key) {
        units.push(_.find(vm.activeUnits, { 'id': parseInt(value) }));
      });
      vm.course.oldUnits = _.compact(units).length > 0 ? units : [];
      vm.course.addUnits = [];
      vm.course.categories = vm.course.courseCategories;
      $state.go('admin.lms.editCourse');
    }

    function previewCourse(evt, course) {
      vm.coursePreview = course;
      $http.post(CommonInfo.getAppUrl() + '/getCoursePreview', { courseId: vm.course.id }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.coursePreview = response.data.data[0];
              if (vm.coursePreview && vm.coursePreview.courseCurriculum && vm.coursePreview.units.length > 0) {
                var units = [];
                var unitIds = vm.coursePreview.courseCurriculum.split(',');
                _.forEach(unitIds, function(value, key) {
                  units.push(_.find(vm.coursePreview.units, { 'id': parseInt(value) }));
                });
                vm.coursePreview.units = units;
              }
              $mdDialog.show({
                targetEvent: evt,
                scope: $scope.$new(),
                templateUrl: 'app/admin/coursePreview.tmpl.html',
                parent: angular.element(document.body),
                controller: DialogController,
                fullscreen: true
              });

              function DialogController($scope, $mdDialog, CommonInfo, $http, $sce) {
                $scope.closeDialog = function() {
                  $mdDialog.hide();
                }

                $scope.getUnitDetails = function(unitId) {
                  CommonInfo.setInfo('startCourse', { unitId: unitId, courseId: vm.coursePreview.id });
                  $http.post(CommonInfo.getAppUrl() + "/getunitdetailsbyunit_id", { id: unitId, userName: "preview", userEmail: "preview" }).then(
                    function(response) {
                      if (response && response.data) {
                        if (response.data.status == 1) {
                          $scope.unit = response.data.data;
                          $scope.unit.unitDescription = angular.isString($scope.unit.unitDescription) ? $sce.trustAsHtml($scope.unit.unitDescription) : $scope.unit.unitDescription;
                          $scope.unit.videoHtml = angular.isString($scope.unit.videoHtml) ? $sce.trustAsHtml($scope.unit.videoHtml) : $scope.unit.videoHtml;
                          if (angular.isString($scope.unit.downloadLink))
                            $scope.unit.downloadLink = JSON.parse($scope.unit.downloadLink);
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

    function checkUnit(chip) {
      if (_.includes(vm.course.oldUnits, chip))
        return null;
      return chip;
    }

    // function getCoursesByCategoryId(status, categoryId) {
    //     if (categoryId === null) {
    //         $http.post(CommonInfo.getAppUrl() + "/getallcoursesby_Inst_Id", { id: vm.instructorInfo.id }).then(
    //             function(response) {
    //                 if (response && response.data) {
    //                     if (response.data.status == 1) {
    //                         vm.allCourses = response.data.data;
    //                         _.forEach(vm.allCourses, function(value) {
    //                             value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
    //                             value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
    //                             value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
    //                         });
    //                         if (status == 1)
    //                             vm.activeCourses = _.filter(vm.allCourses, { 'status': 1 });
    //                         else
    //                             vm.inactiveCourses = _.filter(vm.allCourses, { 'status': 0 });
    //                     } else if (response.data.status == 2) {
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
    //     } else {
    //         var data = {
    //             id: categoryId,
    //             status: status
    //         };
    //         $http.post(CommonInfo.getAppUrl() + '/getcourseslistbycat_id', data).then(
    //             function(response) {
    //                 if (response && response.data) {
    //                     if (response.data.status == 1) {
    //                         _.forEach(response.data.data, function(value) {
    //                             value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
    //                             value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
    //                         });
    //                         if (status == 1) {
    //                             vm.activeCourses = response.data.data;
    //                         } else {
    //                             vm.inactiveCourses = response.data.data;
    //                         }
    //                     } else if (response.data.status == 2) {
    //                         growl.info(response.data.message);
    //                     }
    //                 } else {
    //                     growl.info('There is some issue, please try after some time');
    //                 }
    //             },
    //             function(response) {
    //                 growl.warning('There is some issue, please try after some time');
    //             }
    //         );
    //     }
    // }

    function getUnitsByCourseId(courseId) {
      var units = {};
      if (courseId === null) {
        $http.post(CommonInfo.getAppUrl() + "/searchunit", {}).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                units = response.data.data;
                _.forEach(units, function(value) {
                  value.unitTypeName = _.map(_.filter(vm.unitTypes, { 'id': value.unitType }), 'name')[0];
                });
                vm.activeUnits = _.filter(units, { 'status': 1 });
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
        var data = {};
        if (courseId)
          data.courseId = courseId;
        $http.post(CommonInfo.getAppUrl() + '/getunitslistbycourse_id', data).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                units = response.data.data;
                _.forEach(units, function(value) {
                  value.unitTypeName = _.map(_.filter(response.data.data, { 'id': value.unitType }), 'name')[0];
                });
                vm.activeUnits = _.filter(response.data.data, { 'status': 1 });
                vm.inactiveUnits = _.filter(response.data.data, { 'status': 0 });
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
      $http.post(CommonInfo.getAppUrl() + "/searchunit", { status: status, name: unitName }).then(
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
              growl.log(response.data.message);
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

    function searchActiveCourses() {
      searchCourses(1, vm.activeCourseSearchText, vm.activeSelectedCategory, vm.activeSelectedInstructor);
    }

    function searchInactiveCourses() {
      searchCourses(0, vm.inactiveCourseSearchText, vm.inactiveSelectedCategory, vm.inactiveSelectedInstructor);
    }

    function searchCourses(status, courseName, categoryId, instructorId) {
      $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: status, name: courseName, categoryId: categoryId, instructorId: instructorId, isForsale: '' }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.allCourses = response.data.data;
              _.forEach(vm.allCourses, function(value) {
                value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                //value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
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
      vm.courseStudentSearchText = '';
      CommonInfo.setInfo('selectedCourse', course);
      $state.go('admin.lms.students');
      showCourseStudents();
    }

    function exportCourseStudents() {
      var deferred = $q.defer();

      $http
        .post(CommonInfo.getAppUrl() + "/exportEnrolledStudents", { courseId: vm.selectedCourse.id, searchText: vm.courseStudentSearchText })
        .success(function(data, status, headers, config) {
          deferred.resolve(data.data);
        });
      return deferred.promise;
    }

    function showCourseStudents() {
      vm.selectedCourse = CommonInfo.getInfo('selectedCourse');
      vm.studentsByCourse = [];
      $http.post(CommonInfo.getAppUrl() + "/getstudentsenrolled", { courseId: vm.selectedCourse.id, searchText: vm.courseStudentSearchText }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.studentsByCourse = response.data.data;
              _.forEach(vm.studentsByCourse, function(value, key){
                value.enrollDate = new Date(value.enrollDate);
              });
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

    function editStudentSubscription(student) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        //scope: $scope.$new(),
        locals: {
          subscription: {
            expiryDate: new Date(student.expiryDate),
            studentId: student.studentId,
            status: student.status,
            modifyBy: CommonInfo.getInfo('userInfo').id
          }
        },
        fullscreen: true,
        template: '<md-dialog aria-label="List dialog">' +
          '<md-toolbar>' +
          '<div class="md-toolbar-tools">' +
          '<h2>Course</h2>' +
          '<span flex></span>' +
          '<md-button class="md-icon-button" ng-click="closeDialog()">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
          '</md-button>' +
          '</div>' +
          '</md-toolbar>' +
          '<md-dialog-content>' +
          '<div class="md-dialog-content">' +
          '<div layout-gt-xs="col">' +
          '<div flex-gt-xs>' +
          '<md-datepicker ng-model="subscription.expiryDate" md-placeholder="Enter from date" md-open-on-focus></md-datepicker>' +
          '</div>' +
          '<div flex-gt-xs class="pull-right">' +
          '<md-switch ng-model="subscription.status" aria-label="Status" ng-true-value="1" ng-false-value="0">Status</md-switch>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</md-dialog-content>' +
          '<md-dialog-actions>' +
          '<md-button class="md-primary" ng-click="updateStudentSubscription()">' +
          'Ok' +
          '</md-button>' +
          '<md-button ng-click="closeDialog()" class="md-primary">' +
          'Close' +
          '</md-button>' +
          '</md-dialog-actions>' +
          '</md-dialog>',
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, $http, subscription) {
        $scope.subscription = subscription;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }

        $scope.updateStudentSubscription = function() {
          if ($scope.subscription.expiryDate)
            $scope.subscription.expiryDate = moment($scope.subscription.expiryDate).format("YYYY-MM-DD");
          $scope.subscription.courseId = vm.selectedCourse.id;
          $http.post(CommonInfo.getAppUrl() + "/updateExpiryDate", $scope.subscription).then(
            function(response) {
              if (response && response.data) {
                if (response.data.status == 1) {
                  $mdDialog.hide();
                  getCourseStudents(vm.selectedCourse);
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
      }
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

    function addCommentToCall(callRequest) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        //scope: $scope.$new(),
        locals: {
          callrequest: {
            id: callRequest.id
          }
        },
        template: '<md-dialog aria-label="List dialog">' +
          '<md-toolbar>' +
          '<div class="md-toolbar-tools">' +
          '<h2>Comment</h2>' +
          '<span flex></span>' +
          '<md-button class="md-icon-button" ng-click="closeDialog()">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
          '</md-button>' +
          '</div>' +
          '</md-toolbar>' +
          '<md-dialog-content>' +
          '<div class="md-dialog-content">' +
          '<div layout-gt-xs="col">' +
          '<md-input-container class="md-block" flex-gt-xs>' +
          '<label for="user_last_name">Comment</label>' +
          '<textarea rows="5" ng-model="callrequest.comments">' +
          '</textarea>' +
          '</md-input-container>' +
          '<div flex-gt-xs class="pull-right">' +
          '<md-switch ng-model="callrequest.status" aria-label="Status" ng-true-value="1" ng-false-value="0">Status</md-switch>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</md-dialog-content>' +
          '<md-dialog-actions>' +
          '<md-button class="md-primary" ng-click="updateCallrequest()">' +
          'Ok' +
          '</md-button>' +
          '<md-button ng-click="closeDialog()" class="md-primary">' +
          'Close' +
          '</md-button>' +
          '</md-dialog-actions>' +
          '</md-dialog>',
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, $http, callrequest) {
        $scope.callrequest = callrequest;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }

        $scope.updateCallrequest = function() {
          $scope.callrequest.commentBy = vm.userInfo.id;
          $http.post(CommonInfo.getAppUrl() + "/updatecourserequest", $scope.callrequest).then(
            function(response) {
              if (response && response.data) {
                if (response.data.status == 1) {
                  $mdDialog.hide();
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
      }
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

    function addReview(evt, course) {
      vm.courseReiview = {
        courseId: course.id,
        addedBy: CommonInfo.getInfo('userInfo').id,
        studentName: '',
        image: '',
        reviewRating: '',
        reviewTitle: '',
        reviewDetails: ''
      };
      $mdDialog.show({
        targetEvent: evt,
        scope: $scope.$new(),
        templateUrl: 'app/admin/instructorReview.tmpl.html',
        parent: angular.element(document.body),
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, CommonInfo, $http, $log, Upload) {
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }

        $scope.addReviews = function(file) {
          if (!file || angular.isString(file)) {
            uploadReviews();
          } else {
            Upload.base64DataUrl(file).then(function(url) {
              vm.courseReiview.image = url;
              uploadReviews();
            });
          }
        }

        function uploadReviews() {
          $http.post(CommonInfo.getAppUrl() + "/createReviewByadmin", vm.courseReiview).then(
            function(response) {
              if (response && response.data) {
                if (response.data.status == 1) {
                  growl.success('Review added successful');
                  $mdDialog.hide();
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

    function updateSocialShares() {
      $http.post(CommonInfo.getAppUrl() + "/updatesocialshares", vm.socialShare).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              growl.success('Social sharing  updated successfuly');
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

    function getCoupons() {
      vm.lmsTab = 7;
      getAllCopuons();
    }

    function getAllCopuons() {
      $http.get(CommonInfo.getAppUrl() + "/getallcoupons").then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.coupons = response.data.data;
              $state.go('admin.lms.coupons');
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

    function addCoupon(coupon) {
      vm.coupon = coupon || {};
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        scope: $scope.$new(),
        fullscreen: true,
        templateUrl: 'app/admin/addCoupon.tmpl.html',
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, $http, growl) {
        $scope.couponType = ["flat", "percent"];
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }

        $scope.addCoupon = function() {
          vm.coupon.dateStart = vm.coupon.dateStart ? moment(vm.coupon.dateStart).format("YYYY-MM-DD") : '';
          vm.coupon.dateExpires = vm.coupon.dateExpires ? moment(vm.coupon.dateExpires).format("YYYY-MM-DD") : '';
          //vm.coupon.discountType = $scope.couponType[vm.coupon.discountType];
          $http.post(CommonInfo.getAppUrl() + "/createCoupon", vm.coupon).then(
            function(response) {
              if (response && response.data) {
                if (response.data.status == 1) {
                  growl.success('Coupon updated successfuly');
                  getAllCopuons();
                  $mdDialog.hide();
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
      }
    }
  }
})();
