(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('CourseDetailsController', CourseDetailsController);

  /** @ngInject */
  function CourseDetailsController(CommonInfo, $log, $http, $mdDialog, $stateParams, $scope, $state, $anchorScroll, growl, _, $sce, RouterTracker) {
    var vm = this;
    var selectedCourseId;
    var selectedCourseName;
    var strlen;
    vm.payuData = {};
    vm.payment = {};

    vm.course;

    vm.loginStage = 1;
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
    vm.charCount = 0;

    vm.login = login;
    vm.otpVerification = otpVerification;
    vm.sendOTP = sendOTP;

    vm.subscribeCourse = subscribeCourse;
    vm.buyCourse = buyCourse;
    vm.sendCallbackRequest = sendCallbackRequest;
    vm.showInstructorCourses = showInstructorCourses;
    vm.showCourse = showCourse;
    vm.showCourseUnit = showCourseUnit;
    vm.showCourseDemo = showCourseDemo;

    vm.applyCoupon = applyCoupon;
    //vm.getInstamojoCall = getInstamojoCall;
    //vm.getRazorCall = getRazorCall;

    activate();

    function activate() {
      selectedCourseId = $stateParams.id;
      selectedCourseName = $stateParams.name;
      $anchorScroll();
      getCourseDetails();
    }

    function getCourseDetails() {
      var data = {
        id: selectedCourseId
      };
      var studentInfo = CommonInfo.getInfo('studentInfo');
      if (studentInfo && studentInfo.userId)
        data.studentId = studentInfo.userId;
      $http.post(CommonInfo.getAppUrl() + "/getcourse_descriptionbycourse_id", data).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              //if (selectedCourseName.replace(/-/g, " ").trim() == response.data.data[0].title.trim()) {
                vm.course = response.data.data[0];
                if (vm.course.description && vm.course.units && vm.course.units.length > 0) {
                  vm.charCount = (vm.course.description.length > 315) ? 300 : 0;
                }
                if (vm.course && vm.course.units) {
                  vm.course.unitTypeCount = _.countBy(vm.course.units, 'unitType');
                }
                if(vm.course && vm.course.courseCurriculum && vm.course.units.length > 0) {
                    var units = [];
                    var unitIds = vm.course.courseCurriculum.toString().split(',');
                    _.forEach(unitIds, function(value, key){
                        units.push(_.find(vm.course.units, { 'id': parseInt(value) }));
                    });
                    vm.course.units = units;
                }
                vm.course.courseStartDate = moment(vm.course.courseStartDate).format("MMM DD, YYYY");
                vm.course.demoVideo = angular.isString(vm.course.demoVideo) ? $sce.trustAsHtml(vm.course.demoVideo) : vm.course.demoVideo;
                if (vm.course.socialShare)
                  getSocialShare();
                if (vm.course.reviewCourse)
                  getCourseReview();
                var routerInfo = RouterTracker.getPreviousRoute();
                if (data.studentId && !vm.course.isSubscribed && routerInfo && routerInfo.route && routerInfo.route.name == 'courseDetails') {
                  getPaymentMethodes();
                  vm.showPaymentOptions = true;
                  vm.payment.amount = vm.course.courseFee;
                }
                getInstructorTestimonials();
                // var studentInfo = CommonInfo.getInfo('studentInfo');
                // vm.payuData = {
                //     key: 'gtKFFx',
                //     txnid: 'product_' + vm.course.id + 'S_' + studentInfo.userId,
                //     amount: parseFloat('200.00').toFixed(2),
                //     productinfo: 'details_' + studentInfo.userId + 'C_' + vm.course.id,
                //     firstname: studentInfo.name,
                //     email: studentInfo.email,
                //     phone: studentInfo.mobile,
                //     surl: 'http://139.44.59.117/#/dashboard',
                //     furl: 'http://139.44.59.117/#/dashboard'
                // };
                // var hashString = vm.payuData.key + '|' + vm.payuData.txnid + '|' + vm.payuData.amount + '|' + vm.payuData.productinfo + '|' + vm.payuData.firstname + '|' + vm.payuData.email + '|||||||||||eCwWELxi';
                // vm.payuData.hash = SHA512(hashString).toLowerCase();
              //}
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

    function getInstructorTestimonials() {
      var data = {
        instructorId: vm.course.instructorId,
        status: 1
      };
      $http.post(CommonInfo.getAppUrl() + "/getactivetestimonials", data).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.instrunctorTestmonials = response.data.data;
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

    function getSocialShare() {
      $http.get(CommonInfo.getAppUrl() + "/getsocialshares").then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.socialShare = _.filter(response.data.data, { 'status': 1 });
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

    function getCourseReview() {
      $http.post(CommonInfo.getAppUrl() + "/searchreviews", { courseId: selectedCourseId }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
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

    function getInstructorDetails() {
      $http.post(CommonInfo.getAppUrl() + "/getallusers", { id: vm.course.instructorId }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.courseInstructor = response.data.data[0];
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

    function buyCourse() {
      var type = _.find(vm.paymentMethods, { 'id': vm.payment.option });
      type = type ? type.pgId : -1;
      if (type != -1) {
        var pg = _.find(vm.paymentGateways, { 'id': type });
        if (pg.name.toLowerCase() == 'razorpay')
          getRazorCall();
        else
          getInstamojoCall();
      } else {
        growl.info('Select payment method');
      }
    }

    function subscribeCourse(evt) {
      var studentInfo = CommonInfo.getInfo('studentInfo');
      if (!studentInfo || !studentInfo.userId) {
        $mdDialog.show({
            targetEvent: evt,
            scope: $scope.$new(),
            templateUrl: 'app/main/login.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true
          })
          .then(function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.status = 'You cancelled the dialog.';
          });
      } else {
        if (vm.course.freeCourse) {
          $http.post(CommonInfo.getAppUrl() + "/createsubscription", { studentId: studentInfo.userId, courseId: selectedCourseId, addedBy: studentInfo.userId }).then(
            function(response) {
              if (response && response.data) {
                if (response.data.status == 1) {
                  $state.go('dashboard')
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
          getPaymentMethodes();
          vm.showPaymentOptions = !vm.showPaymentOptions;
          vm.payment.amount = vm.course.courseFee;
        }
      }
    }

    function getPaymentMethodes() {
      $http.post(CommonInfo.getAppUrl() + "/getpaymentmethods", {}).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.paymentMethods = response.data.data;
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
      $http.post(CommonInfo.getAppUrl() + "/getpaymentgateways", { status: 1 }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.paymentGateways = response.data.data;
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

    function getRazorCall() {
      var studentInfo = CommonInfo.getInfo('studentInfo');
      var pg = _.find(vm.paymentGateways, { 'name': 'Razorpay' });
      var rzpOptions = {
        "key": pg.apiKey,
        "amount": vm.payment.discount ? vm.payment.discount * 100 : vm.payment.amount * 100, //vm.course.courseFee * 100,
        "name": vm.course.title,
        "description": "By " + vm.course.instructorFullName,
        "image": "/assets/images/logo.png",
        "handler": function(response) {
          $http.post(CommonInfo.getAppUrl() + "/createrazorpayorder", { studentId: studentInfo.userId, courseId: selectedCourseId, orderBy: studentInfo.userId, type: 'student', paymentId: response.razorpay_payment_id, couponId: vm.payment.couponId }).then(
            function(response) {
              if (response && response.data) {
                if (response.data.status == 1) {
                  $state.go('dashboard')
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
        },
        "prefill": {
          "name": studentInfo.userName,
          "email": studentInfo.email,
          "contact": studentInfo.mobile
        },
        "notes": {
          "address": ''
        },
        "theme": {
          "color": "#18BC9C"
        }
      };
      var rzp1 = new Razorpay(rzpOptions);
      rzp1.open()
    }

    function getInstamojoCall() {
      var studentInfo = CommonInfo.getInfo('studentInfo');
      var data = {
        purpose: 'Payment stud:' + studentInfo.userId + '_cour:' + vm.course.id,
        amount: vm.payment.discount ? vm.payment.discount : vm.payment.amount, //vm.course.courseFee,
        phone: studentInfo.mobile,
        buyerName: studentInfo.name,
        email: studentInfo.email,
        studentId: studentInfo.userId,
        courseId: vm.course.id,
        type: 'student',
        couponId: vm.payment.couponId
      };
      $http.post(CommonInfo.getAppUrl() + "/createinstamojorequest", data).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1 && response.data) {
              window.open(response.data.data + '?embed=form', "_self");
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

    function applyCoupon() {
      if (vm.payment && vm.payment.coupon) {
        $http.post(CommonInfo.getAppUrl() + "/applyCoupon", { courseId: selectedCourseId, couponCode: vm.payment.coupon }).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success(response.data.message);
                vm.payment.discount = response.data.data.discount;
                vm.payment.couponId = response.data.data.couponId;
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
      } else {
        growl.info('Enter valid coupon code');
      }
    }

    function sendCallbackRequest() {
      if (vm.callbackRequest && vm.callbackRequest.name && vm.callbackRequest.email && vm.callbackRequest.mobile) {
        vm.callbackRequest.courseId = selectedCourseId;
        $http.post(CommonInfo.getAppUrl() + "/sendcourserequest", vm.callbackRequest).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success('Request send Successfuly');
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
      } else {
        growl.info('All fields are compulsory');
      }
    }

    function showInstructorCourses() {
      if (vm.course.instructorId) {
        $state.go('instructorCourses', { name: vm.course.instructorFullName.replace(/ /g, "-"), id: vm.course.instructorId })
      }
    }

    function showCourse(course) {
      var studentInfo = CommonInfo.getInfo('studentInfo');
      var courseDetails;
      $http.post(CommonInfo.getAppUrl() + "/getcoursedetailsbycourse_id", { courseId: course.id, studentId: studentInfo.userId }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              courseDetails = response.data.data[0];
              CommonInfo.setInfo('startCourse', { unitId: courseDetails.units[0].id, courseId: courseDetails.id });
              $state.go('startCourse', { courseName: courseDetails.title.replace(/ /g, "-") });
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

    function showCourseUnit(event, unit) {
      if (!vm.course.isExpired && vm.course.isSubscribed) {
        CommonInfo.setInfo('startCourse', { unitId: unit.id, courseId: vm.course.id });
        $state.go('startCourse', { courseName: vm.course.title.replace(/ /g, "-") });
      } else if (!vm.course.isSubscribed && unit.freeUnit) {
        var studentInfo = CommonInfo.getInfo('studentInfo');
        $http.post(CommonInfo.getAppUrl() + "/getunitdetailsbyunit_id", { id: unit.id, userName: studentInfo.name, userEmail: studentInfo.email }).then(
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
                var parentEl = angular.element(document.body);
                $mdDialog.show({
                  parent: parentEl,
                  targetEvent: event,
                  scope: $scope.$new(),
                  fullscreen: true,
                  template: '<md-dialog aria-label="List dialog" flex="70">' +
                    '<md-toolbar>' +
                    '<div class="md-toolbar-tools">' +
                    '<h2><span ng-bind="vm.course.title"></span> (Free)</h2>' +
                    '<span flex></span>' +
                    '<md-button class="md-icon-button" ng-click="closeDialog()">' +
                    '<i class="fa fa-times" aria-hidden="true"></i>' +
                    '</md-button>' +
                    '</div>' +
                    '</md-toolbar>' +
                    '<md-dialog-content>' +
                    '<div  class="md-dialog-content">' +
                    '<p ng-bind="vm.unit.description"></p>' +
                    '<md-button md-no-ink class="md-primary" ng-href="{{vm.unit.downloadLink.videoDownloadLink}}" download aria-label="Download Video" ng-if="vm.unit.downloadLink && vm.unit.downloadLink.videoDownloadLink">' +
                    '<i class="fa fa-download" aria-hidden="true"></i> Download Video' +
                    '</md-button>' +
                    '<div ng-if="vm.unit.videoId" class="embed-responsive embed-responsive-16by9">' +
                    '<p ng-bind-html="vm.unit.videoHtml" class="text-center embed-responsive-item"></p>' +
                    '</div>' +
                    '<p ng-bind-html="vm.unit.unitDescription"></p>' +
                    '<div ng-if="vm.unit.test">' +
                    '<p ng-bind="vm.unit.test.title"></p>' +
                    '<p ng-bind="vm.unit.test.instruction"></p>' +
                    '<div ng-repeat="question in vm.unit.test.questions">' +
                    '<h4 style="margin:3px 0px;">Q. <span ng-bind="$index + 1"></span></h4>' +
                    '<p ng-bind-html="question.question"></p>' +
                    '<div>' +
                    '<div class="exercise--instructions-title">' +
                    '<h5>Options</h5>' +
                    '</div>' +
                    '<div>' +
                    '<div class="exercise--instructions exercise--typography">' +
                    '<md-radio-group ng-model="vm.userCurrentQuestion[$index].answer" md-no-ink="false">' +
                    '<md-radio-button aria-label="options" ng-repeat="answer in question.answers" ng-value="answer.ansKey" class="md-primary">' +
                    '<p ng-bind-html="answer.answerText"></p>' +
                    '</md-radio-button>' +
                    '</md-radio-group>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<hr />' +
                    '</div>' +
                    '<div class="vex--buttons">' +
                    '<a class="btn btn-small btn-primary" href="javascript:void(0);" ng-click="vm.submitExam(false);">Submit</a>' +
                    '</div>' +
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

                function DialogController($scope, $mdDialog) {
                  $scope.closeDialog = function() {
                    $mdDialog.hide();
                  }
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

    function showCourseDemo(event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        scope: $scope.$new(),
        fullscreen: true,
        template: '<md-dialog aria-label="List dialog" flex="70">' +
          '<md-toolbar>' +
          '<div class="md-toolbar-tools">' +
          '<h2><span ng-bind="vm.course.title"></span> (Demo)</h2>' +
          '<span flex></span>' +
          '<md-button class="md-icon-button" ng-click="closeDialog()">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
          '</md-button>' +
          '</div>' +
          '</md-toolbar>' +
          '<md-dialog-content>' +
          '<div class="embed-responsive embed-responsive-16by9">' +
          '<div ng-bind-html="vm.course.demoVideo" class="embed-responsive-item">' +
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

      function DialogController($scope, $mdDialog) {
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
      }
    }

    function login() {
      if (vm.student.emailorphone && vm.student.password) {
        vm.student.fromSource = "flavido";
        $http.post(CommonInfo.getAppUrl() + "/studentlogin", vm.student).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                $mdDialog.hide();
                //growl.success('Login Successfuly');
                CommonInfo.setInfo('studentInfo', response.data.data);
                $state.reload();
              } else if (response.data.status == 3) {
                //CommonInfo.setInfo('studentInfo', response.data.data);
                vm.verification.student_id = response.data.data.userId;
                vm.student.student_id = response.data.data.userId;
                if (response.data.message == '2') {
                  vm.loginStage = 2;
                }
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
                CommonInfo.setInfo('studentInfo', response.data.data);
                $state.reload();
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

    /*
     *  Secure Hash Algorithm (SHA512)
     *  http://www.happycode.info/
     */

    function SHA512(str) {
      function int64(msint_32, lsint_32) {
        this.highOrder = msint_32;
        this.lowOrder = lsint_32;
      }

      var H = [new int64(0x6a09e667, 0xf3bcc908), new int64(0xbb67ae85, 0x84caa73b),
        new int64(0x3c6ef372, 0xfe94f82b), new int64(0xa54ff53a, 0x5f1d36f1),
        new int64(0x510e527f, 0xade682d1), new int64(0x9b05688c, 0x2b3e6c1f),
        new int64(0x1f83d9ab, 0xfb41bd6b), new int64(0x5be0cd19, 0x137e2179)
      ];

      var K = [new int64(0x428a2f98, 0xd728ae22), new int64(0x71374491, 0x23ef65cd),
        new int64(0xb5c0fbcf, 0xec4d3b2f), new int64(0xe9b5dba5, 0x8189dbbc),
        new int64(0x3956c25b, 0xf348b538), new int64(0x59f111f1, 0xb605d019),
        new int64(0x923f82a4, 0xaf194f9b), new int64(0xab1c5ed5, 0xda6d8118),
        new int64(0xd807aa98, 0xa3030242), new int64(0x12835b01, 0x45706fbe),
        new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, 0xd5ffb4e2),
        new int64(0x72be5d74, 0xf27b896f), new int64(0x80deb1fe, 0x3b1696b1),
        new int64(0x9bdc06a7, 0x25c71235), new int64(0xc19bf174, 0xcf692694),
        new int64(0xe49b69c1, 0x9ef14ad2), new int64(0xefbe4786, 0x384f25e3),
        new int64(0x0fc19dc6, 0x8b8cd5b5), new int64(0x240ca1cc, 0x77ac9c65),
        new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
        new int64(0x5cb0a9dc, 0xbd41fbd4), new int64(0x76f988da, 0x831153b5),
        new int64(0x983e5152, 0xee66dfab), new int64(0xa831c66d, 0x2db43210),
        new int64(0xb00327c8, 0x98fb213f), new int64(0xbf597fc7, 0xbeef0ee4),
        new int64(0xc6e00bf3, 0x3da88fc2), new int64(0xd5a79147, 0x930aa725),
        new int64(0x06ca6351, 0xe003826f), new int64(0x14292967, 0x0a0e6e70),
        new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
        new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, 0x9d95b3df),
        new int64(0x650a7354, 0x8baf63de), new int64(0x766a0abb, 0x3c77b2a8),
        new int64(0x81c2c92e, 0x47edaee6), new int64(0x92722c85, 0x1482353b),
        new int64(0xa2bfe8a1, 0x4cf10364), new int64(0xa81a664b, 0xbc423001),
        new int64(0xc24b8b70, 0xd0f89791), new int64(0xc76c51a3, 0x0654be30),
        new int64(0xd192e819, 0xd6ef5218), new int64(0xd6990624, 0x5565a910),
        new int64(0xf40e3585, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
        new int64(0x19a4c116, 0xb8d2d0c8), new int64(0x1e376c08, 0x5141ab53),
        new int64(0x2748774c, 0xdf8eeb99), new int64(0x34b0bcb5, 0xe19b48a8),
        new int64(0x391c0cb3, 0xc5c95a63), new int64(0x4ed8aa4a, 0xe3418acb),
        new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, 0xd6b2b8a3),
        new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
        new int64(0x84c87814, 0xa1f0ab72), new int64(0x8cc70208, 0x1a6439ec),
        new int64(0x90befffa, 0x23631e28), new int64(0xa4506ceb, 0xde82bde9),
        new int64(0xbef9a3f7, 0xb2c67915), new int64(0xc67178f2, 0xe372532b),
        new int64(0xca273ece, 0xea26619c), new int64(0xd186b8c7, 0x21c0c207),
        new int64(0xeada7dd6, 0xcde0eb1e), new int64(0xf57d4f7f, 0xee6ed178),
        new int64(0x06f067aa, 0x72176fba), new int64(0x0a637dc5, 0xa2c898a6),
        new int64(0x113f9804, 0xbef90dae), new int64(0x1b710b35, 0x131c471b),
        new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
        new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, 0x9c100d4c),
        new int64(0x4cc5d4be, 0xcb3e42b6), new int64(0x597f299c, 0xfc657e2a),
        new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817)
      ];

      var W = new Array(64);
      var a, b, c, d, e, f, g, h, i, j;
      var T1, T2;
      var charsize = 8;

      function utf8_encode(str) {
        return unescape(encodeURIComponent(str));
      }

      function str2binb(str) {
        var bin = [];
        var mask = (1 << charsize) - 1;
        var len = str.length * charsize;

        for (var i = 0; i < len; i += charsize) {
          bin[i >> 5] |= (str.charCodeAt(i / charsize) & mask) << (32 - charsize - (i % 32));
        }

        return bin;
      }

      function binb2hex(binarray) {
        var hex_tab = "0123456789abcdef";
        var str = "";
        var length = binarray.length * 4;
        var srcByte;

        for (var i = 0; i < length; i += 1) {
          srcByte = binarray[i >> 2] >> ((3 - (i % 4)) * 8);
          str += hex_tab.charAt((srcByte >> 4) & 0xF) + hex_tab.charAt(srcByte & 0xF);
        }

        return str;
      }

      function safe_add_2(x, y) {
        var lsw, msw, lowOrder, highOrder;

        lsw = (x.lowOrder & 0xFFFF) + (y.lowOrder & 0xFFFF);
        msw = (x.lowOrder >>> 16) + (y.lowOrder >>> 16) + (lsw >>> 16);
        lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

        lsw = (x.highOrder & 0xFFFF) + (y.highOrder & 0xFFFF) + (msw >>> 16);
        msw = (x.highOrder >>> 16) + (y.highOrder >>> 16) + (lsw >>> 16);
        highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

        return new int64(highOrder, lowOrder);
      }

      function safe_add_4(a, b, c, d) {
        var lsw, msw, lowOrder, highOrder;

        lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF);
        msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (lsw >>> 16);
        lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

        lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (msw >>> 16);
        msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (lsw >>> 16);
        highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

        return new int64(highOrder, lowOrder);
      }

      function safe_add_5(a, b, c, d, e) {
        var lsw, msw, lowOrder, highOrder;

        lsw = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF) + (e.lowOrder & 0xFFFF);
        msw = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (e.lowOrder >>> 16) + (lsw >>> 16);
        lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

        lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (e.highOrder & 0xFFFF) + (msw >>> 16);
        msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (e.highOrder >>> 16) + (lsw >>> 16);
        highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

        return new int64(highOrder, lowOrder);
      }

      function maj(x, y, z) {
        return new int64(
          (x.highOrder & y.highOrder) ^ (x.highOrder & z.highOrder) ^ (y.highOrder & z.highOrder),
          (x.lowOrder & y.lowOrder) ^ (x.lowOrder & z.lowOrder) ^ (y.lowOrder & z.lowOrder)
        );
      }

      function ch(x, y, z) {
        return new int64(
          (x.highOrder & y.highOrder) ^ (~x.highOrder & z.highOrder),
          (x.lowOrder & y.lowOrder) ^ (~x.lowOrder & z.lowOrder)
        );
      }

      function rotr(x, n) {
        if (n <= 32) {
          return new int64(
            (x.highOrder >>> n) | (x.lowOrder << (32 - n)),
            (x.lowOrder >>> n) | (x.highOrder << (32 - n))
          );
        } else {
          return new int64(
            (x.lowOrder >>> n) | (x.highOrder << (32 - n)),
            (x.highOrder >>> n) | (x.lowOrder << (32 - n))
          );
        }
      }

      function sigma0(x) {
        var rotr28 = rotr(x, 28);
        var rotr34 = rotr(x, 34);
        var rotr39 = rotr(x, 39);

        return new int64(
          rotr28.highOrder ^ rotr34.highOrder ^ rotr39.highOrder,
          rotr28.lowOrder ^ rotr34.lowOrder ^ rotr39.lowOrder
        );
      }

      function sigma1(x) {
        var rotr14 = rotr(x, 14);
        var rotr18 = rotr(x, 18);
        var rotr41 = rotr(x, 41);

        return new int64(
          rotr14.highOrder ^ rotr18.highOrder ^ rotr41.highOrder,
          rotr14.lowOrder ^ rotr18.lowOrder ^ rotr41.lowOrder
        );
      }

      function gamma0(x) {
        var rotr1 = rotr(x, 1),
          rotr8 = rotr(x, 8),
          shr7 = shr(x, 7);

        return new int64(
          rotr1.highOrder ^ rotr8.highOrder ^ shr7.highOrder,
          rotr1.lowOrder ^ rotr8.lowOrder ^ shr7.lowOrder
        );
      }

      function gamma1(x) {
        var rotr19 = rotr(x, 19);
        var rotr61 = rotr(x, 61);
        var shr6 = shr(x, 6);

        return new int64(
          rotr19.highOrder ^ rotr61.highOrder ^ shr6.highOrder,
          rotr19.lowOrder ^ rotr61.lowOrder ^ shr6.lowOrder
        );
      }

      function shr(x, n) {
        if (n <= 32) {
          return new int64(
            x.highOrder >>> n,
            x.lowOrder >>> n | (x.highOrder << (32 - n))
          );
        } else {
          return new int64(
            0,
            x.highOrder << (32 - n)
          );
        }
      }

      str = utf8_encode(str);
      strlen = str.length * charsize;
      str = str2binb(str);

      str[strlen >> 5] |= 0x80 << (24 - strlen % 32);
      str[(((strlen + 128) >> 10) << 5) + 31] = strlen;

      for (var i = 0; i < str.length; i += 32) {
        a = H[0];
        b = H[1];
        c = H[2];
        d = H[3];
        e = H[4];
        f = H[5];
        g = H[6];
        h = H[7];

        for (var j = 0; j < 80; j++) {
          if (j < 16) {
            W[j] = new int64(str[j * 2 + i], str[j * 2 + i + 1]);
          } else {
            W[j] = safe_add_4(gamma1(W[j - 2]), W[j - 7], gamma0(W[j - 15]), W[j - 16]);
          }

          T1 = safe_add_5(h, sigma1(e), ch(e, f, g), K[j], W[j]);
          T2 = safe_add_2(sigma0(a), maj(a, b, c));
          h = g;
          g = f;
          f = e;
          e = safe_add_2(d, T1);
          d = c;
          c = b;
          b = a;
          a = safe_add_2(T1, T2);
        }

        H[0] = safe_add_2(a, H[0]);
        H[1] = safe_add_2(b, H[1]);
        H[2] = safe_add_2(c, H[2]);
        H[3] = safe_add_2(d, H[3]);
        H[4] = safe_add_2(e, H[4]);
        H[5] = safe_add_2(f, H[5]);
        H[6] = safe_add_2(g, H[6]);
        H[7] = safe_add_2(h, H[7]);
      }

      var binarray = [];
      for (var i = 0; i < H.length; i++) {
        binarray.push(H[i].highOrder);
        binarray.push(H[i].lowOrder);
      }
      return binb2hex(binarray);
    }
  }
})();
