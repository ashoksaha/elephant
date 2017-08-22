(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController(CommonInfo, $http, growl, $state, $log, $localStorage, $window, _, moment, $mdDialog, $sce) {
    var vm = this;

    vm.contactUs = {};
    vm.showOtpField = false;
    vm.homeLearnSelected = 0;
    vm.loginStage = 1;
    vm.testimonials = [];
    vm.notesList = [];
    vm.allCourses = [];
    vm.stars = [1, 2, 3, 4, 5];
    vm.student = {
      student_id: '',
      emailorphone: '',
      password: '',
      phone: ''
    };
    vm.verification = {
      OTP: '',
      student_id: '',
      phone: ''
    };

    vm.displayLecture = {
      currentIndex: 0,
      videos: [
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/MdptSuZvQLA?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/A3t_2pi-qTY?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/0K3yWSG4wyI?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/ACv44Xcvrsc?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/UR8WrUJGHvw?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/MdptSuZvQLA?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/DJBhyd8uzmw?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/aFmP0BrLTUk?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/YYx7lIyoNiY?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/6TaNoFj0Zi8?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/kURSIhChBP0?modestbranding=1" frameborder="0" allowfullscreen></iframe>') },
        { video: $sce.trustAsHtml('<iframe src="https://www.youtube.com/embed/3-L12Zf45PU" frameborder="0" allowfullscreen></iframe>') }
      ]
    };

    vm.displayLecture.totalVideos = vm.displayLecture.videos.length;

    vm.mainBanners = [];

    vm.login = login;
    vm.otpVerification = otpVerification;
    vm.sendOTP = sendOTP;
    vm.showCourseDetails = showCourseDetails;
    vm.showCourseDemo = showCourseDemo;

    activate();

    function activate() {
      gethomeCategories();
      gethomeCourses();
      getTestimonials();
      var studentInfo = CommonInfo.getInfo('studentInfo');
      if (studentInfo && studentInfo.userId) {
        $state.go('dashboard');
      } else {
        $state.go('main');
      }
    }

    function login() {
      if (vm.student.emailorphone && vm.student.password) {
        vm.student.fromSource = "flavido";
        $http.post(CommonInfo.getAppUrl() + "/studentlogin", vm.student).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                //growl.success('Login Successfuly');
                CommonInfo.setInfo('studentInfo', response.data.data);
                $state.go('dashboard');
              } else if (response.data.status == 3) {
                //CommonInfo.setInfo('studentInfo', response.data.data);
                vm.verification.student_id = response.data.data.userId;
                vm.student.student_id = response.data.data.userId;
                vm.verification.phone = response.data.data.mobile;
                if (response.data.message == '1')
                  vm.showOtpField = true;
                vm.loginStage = 2;
                // if (response.data.message == '2') {
                //     vm.loginStage = 2;
                // }
              } else if (response.data.status == 2) {
                growl.info(response.data.message);
              }
            } else {
              growl.warning('There is some issue, please try after some time');
            }
          },
          function(response) {
            growl.warning('There is some issue, please try after some time');
          }
        );
      }
    }

    function otpVerification() {
      if (vm.verification && vm.verification.OTP && vm.verification.student_id && vm.verification.phone) {
        $http.post(CommonInfo.getAppUrl() + "/verifyotp", vm.verification).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success(response.data.message);
                CommonInfo.setInfo('studentInfo', response.data.data);
                $state.go('dashboard');
              } else if (response.data.status == 2) {
                growl.info(response.data.message);
              }
            } else {
              growl.warning('There is some issue, please try after some time');
            }
          },
          function(response) {
            growl.warning('There is some issue, please try after some time');
          }
        );
      }
    }

    function sendOTP() {
      if (vm.verification && vm.verification.phone && vm.verification.student_id) {
        $http.post(CommonInfo.getAppUrl() + "/verifymobileandsendotp", vm.verification).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success('OTP send');
                vm.showOtpField = true;
              } else if (response.data.status == 2) {
                growl.info(response.data.message);
              }
            } else {
              growl.warning('There is some issue, please try after some time');
            }
          },
          function(response) {
            growl.warning('There is some issue, please try after some time');
          }
        );
      }
    }

    function getTestimonials() {
      $http.post(CommonInfo.getAppUrl() + "/getactivetestimonials", {}).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.testimonials = response.data.data;
              vm.testimonialsRows = _.chunk(vm.testimonials, 2);
              // _.forEach(vm.testimonials, function(value, key) {
              //   value.charCount = (value.testimonial.length > 240) ? 230 : '';
              // });
            } else if (response.data.status == 2) {
              $log.log(response.data.message);
            }
          } else {
            $log.log('unable to fetch testimonials');
          }
        },
        function(response) {
          $log.log('unable to fetch testimonials');
        }
      );
    }

    function getAllCourses() {
      $http.post(CommonInfo.getAppUrl() + "/searchcourses", { status: 1 }).then(
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

    function gethomeCategories() {
      $http.post(CommonInfo.getAppUrl() + "/gethomepagecategories", { status: 1 }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.homeCategories = _.filter(response.data.data, { 'parentId': 0 });
              _.forEach(vm.homeCategories, function(value, key) {
                value.childCategories = _.filter(response.data.data, { 'parentId': value.id });
              });
              vm.mainBannersList = _.remove(vm.homeCategories, function(n) {
                return n.position == -1;
              });
              if (vm.mainBannersList && vm.mainBannersList.length > 0)
                vm.mainBanners = vm.mainBannersList[0].childCategories;
            } else if (response.data.status == 2) {
              growl.info(response.data.message);
            }
          } else {
            growl.warning('There is some issue, please try after some time');
          }
        },
        function(response) {
          growl.warning('There is some issue, please try after some time');
        }
      );
    }

    function gethomeCourses() {
      $http.post(CommonInfo.getAppUrl() + "/searchcourses", { showOnhome: 1 }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.homeCourses = response.data.data;
            } else if (response.data.status == 2) {
              growl.info(response.data.message);
            }
          } else {
            growl.warning('There is some issue, please try after some time');
          }
        },
        function(response) {
          growl.warning('There is some issue, please try after some time');
        }
      );
    }

    function showCourseDetails(course) {
      if (course) {
        CommonInfo.setInfo('selectedCourseId', course.id);
        CommonInfo.setInfo('courseSearchCriteria', vm.courseSearchCriteria);
        $state.go('courseDetails', { name: course.title.replace(/ /g, "_") })
      }
    }

    function showCourseDemo(event, course) {
      //event.stopPropagation();
      //event.preventDefault();
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        locals: {
          course: course
        },
        fullscreen: true,
        template: '<md-dialog aria-label="List dialog" flex="70">' +
          '<md-toolbar>' +
          '<div class="md-toolbar-tools">' +
          '<h2><span ng-bind="course.title"></span> (Demo)</h2>' +
          '<span flex></span>' +
          '<md-button class="md-icon-button" ng-click="closeDialog()">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
          '</md-button>' +
          '</div>' +
          '</md-toolbar>' +
          '<md-dialog-content>' +
          '<div class="embed-responsive embed-responsive-16by9">' +
          '<div ng-bind-html="course.demoVideo" class="embed-responsive-item">' +
          '</div>' +
          '</div>' +
          '</md-dialog-content>' +
          '<md-dialog-actions>' +
          '<md-button ng-click="closeDialog()" class="md-primary">' +
          'Close' +
          '</md-button>' +
          '</md-dialog-actions>' +
          '</md-dialog>',
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, course) {
        $scope.course = course;
        $scope.course.demoVideo = angular.isString($scope.course.demoVideo) ? $sce.trustAsHtml($scope.course.demoVideo) : $scope.course.demoVideo;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
      }
    }
  }
})();
