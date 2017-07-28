(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('AdminStudentsController', AdminStudentsController);

  /** @ngInject */
  function AdminStudentsController(CommonInfo, $http, growl, $log, _, $scope, $state, $q, $mdDialog) {
    var vm = this;

    vm.isCollapsed = true;
    vm.studentListTab = 1;

    vm.getAllStudents = getAllStudents;
    vm.isStudentSelected = isStudentSelected;
    vm.addToCourse = addToCourse;

    vm.createStudent = createStudent;
    vm.updateStudent = updateStudent;
    vm.editStudent = editStudent;
    vm.showLoginLog = showLoginLog;
    vm.exportStudent = exportStudent;
    vm.showStudentCourses = showStudentCourses;

    activate();

    function activate() {
      vm.userInfo = CommonInfo.getInfo('userInfo');
      getAllStudents(0);
      getAllCourses();
    }

    function getAllStudents(page) {
      vm.currentPage = page;
      $http.post(CommonInfo.getAppUrl() + "/searchstudent", { page: page, searchText: vm.studentSearchText, status: 0 }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.students = response.data.data;
              vm.totalStudents = response.data.totalCount;
              vm.lastPage = Math.ceil(vm.totalStudents / 25) - 1;
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
      $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: 1, isForsale: '' }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.allCourses = response.data.data;
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

    function isStudentSelected() {
      return _.filter(vm.students, { 'isSelected': true }).length;
    }

    function addToCourse(courseId) {
      if (courseId && isStudentSelected()) {
        var data = {
          studentIds: _.map(_.filter(vm.students, { 'isSelected': true }), 'id'),
          courseId: courseId,
          addedBy: CommonInfo.getInfo('userInfo').id
        };
        $http.post(CommonInfo.getAppUrl() + "/addstudentstocourse", data).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success('Students added to course');
              } else if (response.data.status == 2) {
                growl.info(response.data.message);
              }
            } else {
              growl.info('There is some issue, please try after some time');
            }
          },
          function(response) {
            $log.log(response);
            growl.info('There is some issue, please try after some time');
          }
        );
      }
    }

    function createStudent() {
      if (vm.student.userName && vm.student.email && vm.student.mobile) {
        if (vm.student.id)
          vm.student.updatedBy = vm.userInfo.id;
        else
          vm.student.registerBy = vm.userInfo.id;
        $http.post(CommonInfo.getAppUrl() + '/addstudentbyadmin', vm.student).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success('Student added successfuly');
              } else if (response.data.status == 2) {
                growl.info(response.data.message);
              }
            } else {
              growl.info('There is some issue, please try after some time');
            }
          },
          function(response) {
            $log.log(response);
            growl.warning('There is some issue, please try after some time');
          }
        );
      }
    }

    function updateStudent() {
      if (vm.student.userName && vm.student.email && vm.student.mobile) {
        vm.student.updatedBy = vm.userInfo.id;
        vm.student.studentId = vm.student.id;
        $http.post(CommonInfo.getAppUrl() + '/updatestudentbyadmin', vm.student).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success('Student updated successfuly');
                $state.go('admin.student.studentList')
              } else if (response.data.status == 2) {
                growl.info(response.data.message);
              }
            } else {
              growl.info('There is some issue, please try after some time');
            }
          },
          function(response) {
            $log.log(response);
            growl.warning('There is some issue, please try after some time');
          }
        );
      }
    }

    function editStudent(student) {
      vm.student = student;
      $state.go('admin.student.editStudent');
    }

    function showLoginLog(student) {
      var data = {};
      vm.studentLoginLog = [];
      vm.allStudentLoginLog = null;
      if (student)
        data.studentId = student.id;
      $http.post(CommonInfo.getAppUrl() + '/getstudentloginlogs', data).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              if (student)
                vm.studentLoginLog = response.data.data;
              else
                vm.allStudentLoginLog = response.data.data;
              $state.go('admin.student.loginLog')
            } else if (response.data.status == 2) {
              growl.info(response.data.message);
            }
          } else {
            growl.info('There is some issue, please try after some time');
          }
        },
        function(response) {
          $log.log(response);
          growl.warning('There is some issue, please try after some time');
        }
      );
    }

    function exportStudent() {
      var deferred = $q.defer();

      $http
        .post(CommonInfo.getAppUrl() + "/exportStudents", { 'searchText': vm.studentSearchText })
        .success(function(data, status, headers, config) {
          deferred.resolve(data.data);
        });
      return deferred.promise;
    }

    function showStudentCourses(evt, student) {
      $http.post(CommonInfo.getAppUrl() + '/getCoursesByStudId', { studentId: student.id }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.allStudentCourses = response.data.data;
              $mdDialog.show({
                targetEvent: evt,
                scope: $scope.$new(),
                locals: {
                  student: student
                },
                templateUrl: 'app/admin/studentCourses.tmpl.html',
                parent: angular.element(document.body),
                controller: DialogController
              });

              function DialogController($scope, $mdDialog, student) {
                $scope.student = student;
                $scope.closeDialog = function() {
                  $mdDialog.hide();
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
          $log.log(response);
          growl.warning('There is some issue, please try after some time');
        }
      );
    }
  }
})();
