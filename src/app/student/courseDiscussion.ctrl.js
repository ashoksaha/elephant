(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentCourseDiscussionController', StudentCourseDiscussionController);

    /** @ngInject */
    function StudentCourseDiscussionController(CommonInfo, $log, $http, $stateParams, growl, $state) {
        var vm = this;
        var selectedCourseId;
        var studentInfo;

        vm.selectedCourseName;

        vm.startDiscussion = startDiscussion;
        vm.showThread = showThread;

        activate();

        function activate() {
            selectedCourseId = $stateParams.id;
            vm.selectedCourseName = $stateParams.name;
            studentInfo = CommonInfo.getInfo('studentInfo');
            getAllDiscussions();
        }

        function getAllDiscussions() {
            $http.post(CommonInfo.getAppUrl() + "/getalldiscussions", { courseId: selectedCourseId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            vm.courseDiscussions = response.data.data;
                        } else if (response.data.status == 2) {
                            growl.info(response.data.message);
                        }
                    } else {
                        growl.info('There is some issue, please try after some time');
                    }
                },
                function(response) {
                    growl.info('There is some issue, please try after some time');
                }
            );
        }

        function startDiscussion() {
            if (vm.newDiscussion.postTitle && vm.newDiscussion.postDesc) {
                vm.addNewDiscussion = false;
                vm.newDiscussion.studentId = studentInfo.userId;
                vm.newDiscussion.courseId = selectedCourseId;
                $http.post(CommonInfo.getAppUrl() + "/creatediscussion", vm.newDiscussion).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                getAllDiscussions();
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

        function showThread(discussion){
            if(discussion) {
                $state.go('threads', { id: discussion.id, name: discussion.postTitle });
            }
        }
    }
})();
