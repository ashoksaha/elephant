(function() {
  'use strict';

  angular
    .module('flavido')
    .controller('InstructorDashboardController', InstructorDashboardController);

  /** @ngInject */
  function InstructorDashboardController(CommonInfo, $http) {
    var vm = this;

    activate();

    function activate() {
      vm.instructorInfo = CommonInfo.getInfo('instructorInfo');
      getMonthlyOrders();
      getRecentCourses();
    }

    function getMonthlyOrders() {
      $http.post(CommonInfo.getAppUrl() + "/ordersReport", { instructorId: vm.instructorInfo.id, month: 6 }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.monthlyOrders = response.data.data;
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

    function getRecentCourses() {
      $http.post(CommonInfo.getAppUrl() + "/getTopCourses", { instructorId: vm.instructorInfo.id }).then(
        function(response) {
          if (response && response.data) {
            if (response.data.status == 1) {
              vm.recentCourses = response.data.data;
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
})();
