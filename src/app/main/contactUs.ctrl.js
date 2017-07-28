(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('StudentContactUsController', StudentContactUsController);

  /** @ngInject */
  function StudentContactUsController(CommonInfo, $http, $state, $log, growl) {
    var vm = this;

    vm.contactUs = {};

    vm.sendContactUs = sendContactUs;


    function sendContactUs() {
      if (vm.contactUs && vm.contactUs.name && vm.contactUs.mobile && vm.contactUs.email && vm.contactUs.message) {
        $http.post(CommonInfo.getAppUrl() + "/sendcontactus", vm.contactUs).then(
          function(response) {
            if (response && response.data) {
              if (response.data.status == 1) {
                growl.success('Thanks for your feedback! We will respond shortly');
                vm.contactUs = {};
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
