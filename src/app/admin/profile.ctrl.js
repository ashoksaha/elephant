(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('AdminProfileController', AdminProfileController);

    /** @ngInject */
    function AdminProfileController(CommonInfo, $http, growl, Upload, SweetAlert) {
        var vm = this;

        vm.profileTab = 1;
        vm.userInfo = {};
        vm.newProfile = {
            user_name: '',
            profile_picture: '',
            user_bio: '',
            update_id: ''
        };
        vm.contact = {
            email: '',
            mobile: '',
            showVerify: 0
        };
        vm.password = {
            current_password: '',
            new_password: '',
            confirm: ''
        };

        vm.updateProfile = updateProfile;
        vm.updatePassword = updatePassword;
        vm.changeEmail = changeEmail
        vm.changeEmailVerification = changeEmailVerification;
        vm.changeMobile = changeMobile;
        vm.changeMobileVerification = changeMobileVerification;

        activate();

        function activate() {
            vm.userInfo = CommonInfo.getInfo('userInfo');
            if (vm.userInfo) {
                vm.newProfile.user_name = vm.userInfo.username;
                vm.newProfile.profile_picture = vm.userInfo.profile_photo;
                vm.newProfile.user_bio = vm.userInfo.biography;
                vm.newProfile.update_id = vm.userInfo.id;
                vm.contact.email = vm.userInfo.email_id;
                vm.contact.mobile = parseInt(vm.userInfo.phone);
                vm.password.update_id = vm.userInfo.id
            }
        }

        function updateProfile(file) {
            if (!file || angular.isString(file)) {
                uploadProfile();
            } else {
                Upload.base64DataUrl(file).then(function(url) {
                    vm.newProfile.profile_picture = url;
                    uploadProfile();
                });
            }
        }

        function uploadProfile() {
            if (vm.newProfile && vm.newProfile.update_id && vm.newProfile.user_name) {
                $http.post(CommonInfo.getAppUrl() + "/updatestudentprofile", vm.newProfile).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.userInfo.profile_picture = vm.newProfile.profile_picture;
                                vm.userInfo.name = vm.newProfile.user_name;
                                vm.userInfo.biography = vm.newProfile.user_bio;
                                CommonInfo.setInfo('userInfo', vm.userInfo);
                                activate();
                                growl.success('Profile updated successfuly');
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

        function updatePassword() {
            if (vm.password) {
                if (vm.password.current_password && vm.password.new_password && vm.password.current_password != vm.password.new_password) {
                    if (vm.password.confirm && vm.password.new_password == vm.password.confirm) {
                        SweetAlert.swal({
                                title: "Are you sure?",
                                input: 'text',
                                text: "This will change your password forever!",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                closeOnConfirm: false
                            },
                            function(isConfirm) {
                                if (isConfirm) {
                                    $http.post(CommonInfo.getAppUrl() + "/updatestudentpassword", vm.password).then(
                                        function(response) {
                                            if (response && response.data) {
                                                if (response.data.status == 1) {
                                                    SweetAlert.swal("Password Change!", "Your password has been changed.", "success");
                                                    vm.password = {
                                                        current_password: '',
                                                        new_password: '',
                                                        confirm: ''
                                                    };
                                                } else if (response.data.status == 2) {
                                                    growl.info(response.data.message);
                                                } else if (response.data.status == 3) {
                                                    growl.warning(response.data.message);
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
                                    SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
                                }
                            });
                        // $http.post(CommonInfo.getAppUrl() + "/updatestudentpassword", vm.password).then(
                        //     function(response) {
                        //         if (response && response.data) {
                        //             if (response.data.status == 1) {
                        //               growl.success('Password updated successfuly');
                        //             } else if (response.data.status == 2) {
                        //                 growl.info(response.data.message);
                        //             } else if (response.data.status == 3) {
                        //                 growl.warning(response.data.message);
                        //             }
                        //         } else {
                        //             growl.warning('There is some issue, please try after some time');
                        //         }
                        //     },
                        //     function(response) {
                        //         growl.warning('There is some issue, please try after some time');
                        //     }
                        // );
                    } else {
                        growl.info('New password does not match with confirm password');
                    }
                } else {
                    growl.info('You have entered same password');
                }
            }
        }

        function changeEmail() {
            if (vm.contact.email && vm.contact.email != vm.userInfo.email) {
                var data = {
                    student_id: vm.userInfo.userId,
                    new_email: vm.contact.email,
                    old_email: vm.userInfo.email
                };
                $http.post(CommonInfo.getAppUrl() + "/updatestudentemailafterlogin", data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                SweetAlert.swal("Email Change!", "A code for verification has been send to new email id. Please enter code for complete change process", "success");
                                vm.contact.showVerify = 2;
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            } else if (response.data.status == 3) {
                                growl.warning(response.data.message);
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

        function changeEmailVerification() {
            if (vm.contact.emailVerify) {
                var data = {
                    token: vm.contact.emailVerify,
                    new_email: vm.contact.email,
                    casetype: vm.userInfo.userId
                };
                $http.post(CommonInfo.getAppUrl() + "/verifystudentemailcode", data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.contact.showVerify = 0;
                                vm.userInfo.email = vm.contact.email;
                                CommonInfo.setInfo('userInfo', vm.userInfo);
                                activate();
                                growl.success('Email updated successfuly');
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

        function changeMobile() {
            if (vm.contact.mobile && vm.contact.mobile != vm.userInfo.mobile) {
                var data = {
                    student_id: vm.userInfo.userId,
                    old_phone: vm.userInfo.mobile,
                    new_phone: vm.contact.mobile,
                    email: vm.userInfo.email
                };
                $http.post(CommonInfo.getAppUrl() + "/updatestudentphoneafterlogin", data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                SweetAlert.swal("Mobile Change!", "A code for verification has been send to your new mobile number. Please enter code for complete change process", "success");
                                vm.contact.showVerify = 1;
                            } else if (response.data.status == 2) {
                                growl.info(response.data.message);
                            } else if (response.data.status == 3) {
                                growl.warning(response.data.message);
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

        function changeMobileVerification() {
            if (vm.contact.phoneVerify) {
                var data = {
                    OTP: vm.contact.phoneVerify,
                    phone: vm.contact.mobile,
                    student_id: vm.userInfo.userId
                };
                $http.post(CommonInfo.getAppUrl() + "/verifyotpchangephone", data).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Mobile updated successfuly');
                                vm.contact.showVerify = 0;
                                vm.userInfo.mobile = vm.contact.mobile;
                                CommonInfo.setInfo('userInfo', vm.userInfo);
                                activate();
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
