(function() {
    'use strict';

    angular
        .module('flavido')
        .controller('StudentCourseDiscussionThreadController', StudentCourseDiscussionThreadController);

    /** @ngInject */
    function StudentCourseDiscussionThreadController(CommonInfo, $log, $http, $stateParams, growl, _) {
        var vm = this;
        var selectedDiscussionId;

        vm.selectedDiscussionName;
        vm.studentInfo;
        vm.thread = {};

        vm.submitThread = submitThread;
        vm.addComment = addComment;

        activate();

        function activate() {
            selectedDiscussionId = $stateParams.id;
            vm.selectedDiscussionName = $stateParams.name;
            vm.studentInfo = CommonInfo.getInfo('studentInfo');
            console.log(vm.studentInfo);
            getAllDiscussionThreads();
            newThread();
        }

        function getAllDiscussionThreads() {
            $http.post(CommonInfo.getAppUrl() + "/getalldiscussthreads", { discussId: selectedDiscussionId }).then(
                function(response) {
                    if (response && response.data) {
                        if (response.data.status == 1) {
                            var allThreads = response.data.data;
                            vm.discussionThreads = _.filter(allThreads, { 'threadId' : 0});
                            _.forEach(vm.discussionThreads, function(value){
                                value.comments = _.filter(allThreads, {'threadId' : value.id });
                            });
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

        function submitThread() {
            if (vm.thread.threadText) {
                $http.post(CommonInfo.getAppUrl() + "/creatediscussthread", vm.thread).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Comment submited successfuly');
                                newThread();
                                getAllDiscussionThreads();
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
        }

        function addComment(thread) {
            if (thread.commentText) {
                var comment = {};
                comment.threadText = thread.commentText;
                comment.threadId = thread.id;
                comment.discussionId = selectedDiscussionId;
                comment.studentId = vm.studentInfo.userId;
                $http.post(CommonInfo.getAppUrl() + "/creatediscussthread", comment).then(
                    function(response) {
                        if (response && response.data) {
                            if (response.data.status == 1) {
                                growl.success('Comment submited successfuly');
                                getAllDiscussionThreads();
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
        }

        function newThread() {
            vm.thread = {
                id: '',
                discussionId: selectedDiscussionId,
                threadId: '',
                studentId: vm.studentInfo.userId,
                threadText: ''
            };
        }
    }
})();
