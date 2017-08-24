(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('CourseDetailsController', CourseDetailsController);

  /** @ngInject */
  function CourseDetailsController(CommonInfo, $log, $http, $mdDialog, $stateParams, $scope, $state, $anchorScroll, growl, _, $sce, RouterTracker, $timeout, ngMeta) {
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
      selectedCourseName = $stateParams.name;
      $anchorScroll();
      getCourseDetails();
    }

    function getCourseDetails() {
      var data = {
        name: selectedCourseName.replace(/_/g, " ")
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
              selectedCourseId = vm.course.id;
              if (studentInfo && studentInfo.userId) {
                var recentCourses = CommonInfo.getInfo('recentCourses' + studentInfo.userId);
                recentCourses = recentCourses ? recentCourses : [];
                recentCourses.push(vm.course);
                CommonInfo.setInfo('recentCourses' + studentInfo.userId, _.uniqBy(recentCourses, 'id'));
              }
              if (vm.course.description && vm.course.units && vm.course.units.length > 0) {
                vm.charCount = (vm.course.description.length > 315) ? 300 : 0;
              }
              if (vm.course && vm.course.units) {
                vm.course.unitTypeCount = _.countBy(vm.course.units, 'unitType');
              }
              if (vm.course && vm.course.courseCurriculum && vm.course.units.length > 0) {
                var units = [];
                var unitIds = vm.course.courseCurriculum.toString().split(',');
                _.forEach(unitIds, function(value, key) {
                  units.push(_.find(vm.course.units, { 'id': parseInt(value) }));
                });
                vm.course.units = units;
              }
              vm.course.courseStartDate = moment(vm.course.courseStartDate).format("MMM DD, YYYY");
              vm.course.demoVideo = angular.isString(vm.course.demoVideo) ? $sce.trustAsHtml(vm.course.demoVideo) : vm.course.demoVideo;
              if (vm.course.seo && vm.course.seo.length > 0) {
                _.forEach(vm.course.seo, function (value){
                  if(value.tag == "title")
                    ngMeta.setTitle(value.value, '');
                  else
                    ngMeta.setTag(value.tag, value.value);  
                });
              }
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
      $http.post(CommonInfo.getAppUrl() + "/searchreviews", { courseId: selectedCourseId, status: 1 }).then(
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
      if (vm.payment.coupon) {
        $http.post(CommonInfo.getAppUrl() + "/applyCoupon", { courseId: selectedCourseId, couponCode: vm.payment.coupon, studentId: studentInfo.userId, isInUse: true }).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                getRazorRequestCall();
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
        getRazorRequestCall();
      }
    }

    function getRazorRequestCall() {
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
      var studentInfo = CommonInfo.getInfo('studentInfo');
      vm.payment.discount = 0;
      vm.payment.couponId = '';
      if (vm.payment && vm.payment.coupon) {
        $http.post(CommonInfo.getAppUrl() + "/applyCoupon", { courseId: selectedCourseId, couponCode: vm.payment.coupon, studentId: studentInfo.userId }).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success(response.data.message);
                vm.payment.discount = response.data.data[1];
                vm.payment.couponId = response.data.data[2];
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
        $state.go('instructorCourses', { name: vm.course.instructorFullName.replace(/ /g, "_") })
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
              $state.go('startCourse', { courseName: courseDetails.title.replace(/ /g, "_") });
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
        $state.go('startCourse', { courseName: vm.course.title.replace(/ /g, "_") });
      } else if (!vm.course.isSubscribed && unit.freeUnit) {
        var studentInfo = CommonInfo.getInfo('studentInfo') || { name: "demoUser", email: "demo@flavido.com", userId: 49 };
        $http.post(CommonInfo.getAppUrl() + "/getunitdetailsbyunit_id", { id: unit.id, userName: studentInfo.name, userEmail: studentInfo.email, courseId: selectedCourseId, studentId: studentInfo.userId }).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                vm.unit = response.data.data;
                vm.unit.unitDescription = angular.isString(vm.unit.unitDescription) ? $sce.trustAsHtml(vm.unit.unitDescription) : vm.unit.unitDescription;
                vm.unit.embedVideo = angular.isString(vm.unit.embedVideo) ? $sce.trustAsHtml(vm.unit.embedVideo) : vm.unit.embedVideo;
                //vm.unit.videoHtml = angular.isString(vm.unit.videoHtml) ? $sce.trustAsHtml(vm.unit.videoHtml) : vm.unit.videoHtml;
                /*if(vm.unit.videoId) {
                    $timeout(function() {
                      (function(v, i, d, e, o) {
                        v[o] = v[o] || {};
                        v[o].add = v[o].add || function V(a) {
                          (v[o].d = v[o].d || []).push(a);
                        };
                        if (!v[o].l) {
                          v[o].l = 1 * new Date();
                          var a = i.createElement(d), m = i.getElementsByTagName(d)[0];
                          a.async = 1;
                          a.src = e;
                          m.parentNode.insertBefore(a, m);
                        }
                      })(window, document, 'script', '//de122v0opjemw.cloudfront.net/vdo.js', 'vdo');
                      vdo.add({
                        o: vm.unit.OTP,
                      });
                    });
                }*/
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
                    '<p  ng-attr-id="{{\'vdo\' + vm.unit.OTP}}" class="text-center embed-responsive-item vdoBox" style="z-index: 85;"></p>' +
                    '</div>' +
                    '<p ng-bind-html="vm.unit.embedVideo"></p>' +
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

                function DialogController($scope, $mdDialog, $document) {
                  if (vm.unit.videoId) {
                    $timeout(function() {
                      angular.element(document.querySelector('.vdoBox')).empty();
                      (function(v, i, d, e, o) {
                        v[o] = v[o] || {};
                        v[o].add = v[o].add || function V(a) {
                          (v[o].d = v[o].d || []).push(a);
                        };
                        if (!v[o].l) {
                          v[o].l = 1 * new Date();
                          var a = i.createElement(d),
                            m = i.getElementsByTagName(d)[0];
                          a.async = 1;
                          a.src = e;
                          m.parentNode.insertBefore(a, m);
                        }
                      })(window, document, 'script', 'https://de122v0opjemw.cloudfront.net/vdo.js', 'vdo');
                      console.log(vm.unit.OTP);
                      vdo.add({
                        o: vm.unit.OTP,
                      });
                    });
                  }
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
  }
})();
