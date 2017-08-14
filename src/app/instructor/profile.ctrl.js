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
    vm.updatePassword = updatePassword;

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

    function updatePassword() {
      if (vm.password) {
        if (vm.password.currentPassword && vm.password.newPassword && vm.password.currentPassword != vm.password.newPassword) {
          if (vm.password.confirm && vm.password.newPassword == vm.password.confirm) {
            vm.password.id = vm.instructorInfo.id;
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
                  $http.post(CommonInfo.getAppUrl() + "/updateadminpassword", vm.password).then(
                    function(response) {
                      if (response && response.data) {
                        if (response.data.status == 1) {
                          SweetAlert.swal("Password Change!", "Your password has been changed.", "success");
                          vm.password = {
                            currentPassword: '',
                            newPassword: '',
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
          } else {
            growl.info('New password does not match with confirm password');
          }
        } else {
          growl.info('You have entered same password');
        }
      }
    }
  }
})();
