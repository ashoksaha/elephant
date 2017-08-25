(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('DashboardController', DashboardController);

  /** @ngInject */
  function DashboardController(CommonInfo, $http, $log, $state, _, moment, RouterTracker, growl) {
    var vm = this;

    vm.courseTab = 1;
    vm.subscribedCourses = [];
    vm.recentCourses = [];
    vm.invitationMail;
    vm.studentInfo = {};
    vm.homeLearnSelected = 0;

    vm.showCourseDetails = showCourseDetails;
    vm.sendInvitation = sendInvitation;
    vm.showCourse = showCourse;
    vm.showInstructorCourses = showInstructorCourses;

    activate();

    function activate() {
      var router = RouterTracker.getPreviousRoute();
      if (router && (router.name == 'login' || router.name == 'main' || router.name == 'register')) {
        location.reload();
      } else {
        vm.studentInfo = CommonInfo.getInfo('studentInfo');
        if (!vm.studentInfo || !vm.studentInfo.userId) {
          $state.go('main');
        }
        getSubscribedCourses();
        vm.recentCourses = _.reverse(CommonInfo.getInfo('recentCourses' + vm.studentInfo.userId));
      }
    }

    function getSubscribedCourses() {
      $http.post(CommonInfo.getAppUrl() + "/getmycourses", { studentId: vm.studentInfo.userId }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              _.forEach(response.data.data, function(value) {
                  value.courseStartDate = moment(value.courseStartDate).format("MMM DD, YYYY");
                  value.courseEndDate = moment(value.courseEndDate).format("MMM DD, YYYY");
              });
              vm.subscribedCourses = _.filter(response.data.data, { 'isSubscribed': 1 });
              vm.allCourses = _.filter(response.data.data, { 'isSubscribed': 0 });
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

    function showInstructorCourses(course) {
      if (course.instructorId) {
        $state.go('instructorCourses', { name: course.instructorFullName.replace(/ /g, "_") })
      }
    }

    // function getAllCourses() {
    //     $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: 1 }).then(
    //         function(response) {
    //             if (response && response.data) {
    //                 if (response.data.status == 1) {
    //                     vm.allCourses = response.data.data;
    //                     _.forEach(vm.allCourses, function(value) {
    //                         value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
    //                         value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
    //                     });
    //                 } else if (response.data.status == 2) {
    //                     $log.log(response.data.message);
    //                 }
    //             } else {
    //                 $log.log('There is some issue, please try after some time');
    //             }
    //         },
    //         function(response) {
    //             $log.log('There is some issue, please try after some time');
    //         }
    //     );
    // }

    function sendInvitation() {
      if (vm.invitationMail) {
        $http.post(CommonInfo.getAppUrl() + "/sendinvite", { emails: vm.invitationMail, invitedBy: vm.studentInfo.email }).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                vm.allCourses = response.data.data;
                _.forEach(vm.allCourses, function(value) {
                  value.courseStartDate = moment(value.courseStartDate).format("YYYY-MM-DD hh:mm");
                  value.courseEndDate = moment(value.courseEndDate).format("YYYY-MM-DD hh:mm");
                  value.durationParameterText = _.map(_.filter(vm.unitDurations, { 'value': value.durationParameter }), 'name')[0];
                  value.instructor = _.find(vm.allInstructors, { 'id': value.instructorId });
                });
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

    function showCourseDetails(course) {
      $state.go('courseDetails', { name: course.title.replace(/ /g, "_") });
    }

    function showCourse(course) {
      if (course && course.courseCurriculum) {
        var units = course.courseCurriculum.toString().split(',');
        CommonInfo.setInfo('startCourse', { unitId: units[0], courseId: course.id });
        $state.go('startCourse', { courseName: course.title.replace(/ /g, "_") });
      } else {
        growl.info('There is no unit in this course.');
      }
      // $http.post(CommonInfo.getAppUrl() + "/getcoursedetailsbycourse_id", { courseId: course.id, studentId: vm.studentInfo.userId }).then(
      //   function(response) {
      //     if (response && response.data) {
      //       if (response.data.status == 1) {
      //         courseDetails = response.data.data[0];
      //         if (courseDetails && courseDetails.units.length > 0) {
      //           CommonInfo.setInfo('startCourse', { unitId: courseDetails.units[0].id, courseId: courseDetails.id });
      //           $state.go('startCourse', { courseName: courseDetails.title.replace(/ /g, "-") });
      //         } else {
      //           growl.info('There is no unit in this course.');
      //         }
      //       } else if (response.data.status == 2) {
      //         $log.log(response.data.message);
      //       }
      //     } else {
      //       $log.log('There is some issue, please try after some time');
      //     }
      //   },
      //   function(response) {
      //     $log.log('There is some issue, please try after some time');
      //   }
      // );
    }
  }
})();
