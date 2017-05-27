(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('InstructorProfileController', InstructorProfileController);

    /** @ngInject */
    function InstructorProfileController(CommonInfo, $http, growl, Upload, SweetAlert) {
        var vm = this;

        vm.profileTab = 1;
        vm.instructorInfo = {};
        vm.newProfile = {};
        

        vm.updateProfile = updateProfile;

        activate();

        function activate() {
            vm.instructorInfo = CommonInfo.getInfo('instructorInfo');
            vm.newProfile = vm.instructorInfo;
            vm.newProfile.mobile = parseInt(vm.newProfile.mobile);
        }

        function updateProfile(file) {
            if (!file || angular.isString(file)) {
                uploadProfile();
            } else {
                Upload.base64DataUrl(file).then(function(url) {
                    vm.newProfile.profileImg = url;
                    uploadProfile();
                });
            }
        }

        function uploadProfile() {
            if (vm.newProfile) {
                $http.post(CommonInfo.getAppUrl() + "/updateadminprofile", vm.newProfile).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                vm.instructorInfo = vm.newProfile;
                                CommonInfo.setInfo('instructorInfo', vm.instructorInfo);
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
    }
})();
