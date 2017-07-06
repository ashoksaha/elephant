(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(CommonInfo, $http, growl, $state, $log, $localStorage, $window, _, moment) {
        var vm = this;

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

        vm.mainBanners = [{
            text: "Asdcvdfj",
            src: "https://flavido.com/wp-content/uploads/2017/06/pendrive_courses.jpg"
        }, {
            text: "xbthr",
            src: "https://flavido.com/wp-content/uploads/2017/07/1200x400_slider_1200x400.jpg"
        }, {
            text: "ertrert",
            src: "https://flavido.com/wp-content/uploads/2017/06/sociology_big_ban_1200x400.jpg"
        }, {
            text: "xvxcvxvxc",
            src: "https://flavido.com/wp-content/uploads/2017/06/big_banner_anthro-2.jpg"
        }];

        vm.optionalNotes = [
            [{
                link: "https://flavido.com/category/upsc-optional-notes/geography-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon1.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/public-administration-upsc-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon2.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/sociology-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon3.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/history-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon4.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/political-science-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon5.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/philosophy-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon6.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/anthropology-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon7.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/physcology-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon8.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/law-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon9.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/mathematics-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon10.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/literature-optionals/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon11-1.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/economics-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon12.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/medical-science/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon13.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/commerce-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon14.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/management-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon15.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/physics-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon16.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/agricultural-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon17.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/zoology-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon18.jpg"
            }]
        ];

        vm.optionalNotesStart = 0;

        vm.pendriveCourses = [
            [{
                link: "https://flavido.com/category/upsc-optional-notes/geography-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon1.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/public-administration-upsc-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon2.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/sociology-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon3.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/history-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon4.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/political-science-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon5.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/philosophy-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon6.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/anthropology-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon7.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/physcology-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon8.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/law-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon9.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/mathematics-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon10.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/literature-optionals/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon11-1.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/economics-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon12.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/medical-science/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon13.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/commerce-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon14.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/management-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon15.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/physics-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon16.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/agricultural-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon17.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/zoology-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon18.jpg"
            }]
        ];

        vm.pendriveCoursesStart = 0;

        vm.gsNotes = [
            [{
                link: "https://flavido.com/category/upsc-optional-notes/geography-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon1.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/public-administration-upsc-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon2.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/sociology-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon3.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/history-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon4.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/political-science-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon5.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/philosophy-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon6.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/anthropology-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon7.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/physcology-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon8.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/law-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon9.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/mathematics-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon10.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/literature-optionals/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon11-1.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/economics-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon12.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/medical-science/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon13.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/commerce-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon14.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/management-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon15.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/physics-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon16.jpg"
            }],
            [{
                link: "https://flavido.com/category/upsc-optional-notes/agricultural-optional-notes/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon17.jpg"
            }, {
                link: "https://flavido.com/category/upsc-optional-notes/zoology-optional/",
                img: "https://flavido.com/wp-content/uploads/2017/06/icon18.jpg"
            }]
        ];

        vm.gsNotesStart = 0;

        vm.login = login;
        vm.otpVerification = otpVerification;
        vm.sendOTP = sendOTP;
        vm.showCourseDetails = showCourseDetails;

        activate();

        function activate() {
            vm.height = $window.innerHeight;
            vm.width = $window.innerWidth;
            getTestimonials();
            getAllCourses();
            gethomeCategories();
            var studentInfo = CommonInfo.getInfo('studentInfo');
            if (studentInfo && studentInfo.userId) {
                $state.go('dashboard');
            } else {
                $state.go('main');
            }
        }

        function login() {
            if (vm.student.emailorphone && vm.student.password) {
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
                            vm.homeCategories = response.data.data;
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
                $state.go('courseDetails', { name: course.title.replace(/ /g, "-"), id: course.id })
            }
        }
    }
})();
