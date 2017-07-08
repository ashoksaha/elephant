(function() {
    'use strict';

    angular
        .module('flavido')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/student/login/login.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })
            .state('forgotPassword', {
                url: '/forgotPassword',
                templateUrl: 'app/student/login/forgotPassword.html',
                controller: 'ResetPasswordController',
                controllerAs: 'vm'
            })
            .state('resetPassword', {
                url: '/resetPassword?:code?:casetype',
                templateUrl: 'app/student/login/reset.html',
                controller: 'ResetPasswordController',
                controllerAs: 'vm'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'app/student/login/register.html',
                controller: 'RegisterController',
                controllerAs: 'vm'
            })
            .state('courses', {
                url: '/courses',
                abstract: true,
                templateUrl: 'app/main/courses.html',
                controller: 'CoursesController',
                controllerAs: 'vm'
            })
            .state('courses.list', {
                url: '/all',
                templateUrl: 'app/main/coursesList.html'
            })
            .state('courses.search', {
                url: '/schqu/:query',
                templateUrl: 'app/main/coursesSearch.html'
            })
            .state('courseDetails', {
                url: '/course/:id/:name',
                templateUrl: 'app/main/courseDetails.html',
                controller: 'CourseDetailsController',
                controllerAs: 'vm'
            })
            .state('instructorCourses', {
                url: '/inst/:id/:name',
                templateUrl: 'app/main/instructorCourses.html',
                controller: 'InstructorCoursesController',
                controllerAs: 'vm'
            })
            .state('testSeries', {
                url: '/testSeries',
                templateUrl: 'app/main/testSeries.html',
                controller: 'TestSeriesController',
                controllerAs: 'vm'
            })
            .state('testList', {
                url: '/testList/:seriesId/:seriesName',
                templateUrl: 'app/main/testList.html',
                controller: 'TestListController',
                controllerAs: 'vm'
            })
            .state('test', {
                url: '/test',
                templateUrl: 'app/main/test.html',
                controller: 'TestController',
                controllerAs: 'vm'
            })
            .state('instructors', {
                url: '/instructors',
                templateUrl: 'app/main/instructors.html',
                controller: 'InstructorsController',
                controllerAs: 'vm'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'app/student/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'vm'
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'app/student/profile.html',
                controller: 'StudentProfileController',
                controllerAs: 'vm'
            })
            .state('subscriptions', {
                url: '/subscriptions',
                templateUrl: 'app/student/subscriptions.html',
                controller: 'StudentSubscriptionsController',
                controllerAs: 'vm'
            })
            .state('startCourse', {
                url: '/course/:courseName',
                templateUrl: 'app/student/course.html',
                controller: 'StudentCourseUnitController',
                controllerAs: 'vm'
            })
            .state('discussions', {
                url: '/discuss/:name/:id',
                templateUrl: 'app/student/courseDiscussion.html',
                controller: 'StudentCourseDiscussionController',
                controllerAs: 'vm'
            })
            .state('threads', {
                url: '/thread/:name/:id',
                templateUrl: 'app/student/courseDiscussionThread.html',
                controller: 'StudentCourseDiscussionThreadController',
                controllerAs: 'vm'
            })
            .state('aboutUs', {
                url: '/aboutUs',
                templateUrl: 'app/main/aboutUs.html'
            })
            .state('contactUs', {
                url: '/contactUs',
                templateUrl: 'app/main/contactUs.html'
            })
            .state('termsOfUse', {
                url: '/termsOfUse',
                templateUrl: 'app/main/termsOfUse.html'
            })
            .state('privacyPolicy', {
                url: '/privacyPolicy',
                templateUrl: 'app/main/privacyPolicy.html'
            })
            .state('cancellationPolicy', {
                url: '/cancellationPolicy',
                templateUrl: 'app/main/cancellationPolicy.html'
            })
            .state('shippingPolicy', {
                url: '/shippingPolicy',
                templateUrl: 'app/main/shippingPolicy.html'
            })
            .state('faq', {
                url: '/faq',
                templateUrl: 'app/main/faq.html'
            })
            .state('instructorLogin', {
                url: '/instructor/login',
                templateUrl: 'app/instructor/login/instructorLogin.html',
                controller: 'InstructorLoginController',
                controllerAs: 'vm'
            })
            .state('instructorResetPassword', {
                url: '/instructor/resetPassword',
                templateUrl: 'app/instructor/login/instructorResetPassword.html',
                controller: 'InstructorResetPasswordController',
                controllerAs: 'vm'
            })
            .state('instructor', {
                url: '/instructor',
                abstract: true,
                templateUrl: 'app/instructor/main.html',
                controller: 'InstructorController',
                controllerAs: 'vm'
            })
            .state('instructor.profile', {
                url: '/profile',
                templateUrl: 'app/instructor/profile.html',
                controller: 'InstructorProfileController',
                controllerAs: 'vm'
            })
            .state('instructor.dashboard', {
                url: '/dashboard',
                templateUrl: 'app/instructor/dashboard.html',
                controller: 'InstructorResetPasswordController',
                controllerAs: 'vm'
            })
            .state('instructor.orders', {
                url: '/orders',
                templateUrl: 'app/instructor/orders.html',
                controller: 'InstructorOrderListController',
                controllerAs: 'vm'
            })
            .state('instructor.lms', {
                url: '/lms',
                abstract: true,
                templateUrl: 'app/instructor/lms.html',
                controller: 'InstructorLMSController',
                controllerAs: 'vm'
            })
            .state('instructor.lms.courses', {
                url: '/courses',
                templateUrl: 'app/instructor/courses.html'
            })
            .state('instructor.lms.createCourses', {
                url: '/editCourse',
                templateUrl: 'app/instructor/createCourse.html'
            })
            .state('instructor.lms.courseCategories', {
                url: '/category',
                templateUrl: 'app/instructor/categories.html'
            })
            .state('instructor.lms.createCategories', {
                url: '/editCategory',
                templateUrl: 'app/instructor/createCategory.html'
            })
            .state('instructor.lms.units', {
                url: '/unit',
                templateUrl: 'app/instructor/units.html'
            })
            .state('instructor.lms.createUnit', {
                url: '/editUnit',
                templateUrl: 'app/instructor/createUnit.html'
            })
            .state('instructor.lms.students', {
                url: '/students',
                templateUrl: 'app/instructor/studentsCourse.html'
            })
            .state('instructor.lms.callrequest', {
                url: '/callrequests',
                templateUrl: 'app/instructor/courseCallrequest.html'
            })
            .state('instructor.lms.tests', {
                url: '/tests',
                templateUrl: 'app/instructor/tests.html'
            })
            .state('instructor.lms.createTest', {
                url: '/addTest',
                templateUrl: 'app/instructor/createTest.html'
            })
            .state('instructor.lms.createTestSeries', {
                url: '/addTestSeries',
                templateUrl: 'app/instructor/createTestSeries.html'
            })
            .state('instructor.lms.testSeriesTest', {
                url: '/testSeriesTest',
                templateUrl: 'app/instructor/testSeriesTest.html'
            })
            .state('instructor.lms.questions', {
                url: '/questions',
                templateUrl: 'app/instructor/questionList.html'
            })
            .state('adminLogin', {
                url: '/sitemanager/login',
                templateUrl: 'app/admin/login/adminLogin.html',
                controller: 'AdminLoginController',
                controllerAs: 'vm'
            })
            .state('adminResetPassword', {
                url: '/sitemanager/resetPassword',
                templateUrl: 'app/admin/login/adminResetPassword.html',
                controller: 'AdminResetPasswordController',
                controllerAs: 'vm'
            })
            .state('admin', {
                url: '/sitemanager',
                abstract: true,
                templateUrl: 'app/admin/main.html',
                controller: 'AdminController',
                controllerAs: 'vm'
            })
            .state('admin.profile', {
                url: '/profile',
                templateUrl: 'app/admin/profile.html',
                controller: 'AdminProfileController',
                controllerAs: 'vm'
            })
            .state('admin.dashboard', {
                url: '/dashboard',
                templateUrl: 'app/admin/dashboard.html'
            })
            .state('admin.student', {
                url: '/student',
                templateUrl: 'app/admin/student.html',
                controller: 'AdminStudentsController',
                controllerAs: 'vm'
            })
            .state('admin.student.studentList', {
                url: '/list',
                templateUrl: 'app/admin/studentList.html'
            })
            .state('admin.student.addStudent', {
                url: '/addStudent',
                templateUrl: 'app/admin/addStudent.html'
            })
            .state('admin.student.editStudent', {
                url: '/editStudent',
                templateUrl: 'app/admin/addStudent.html'
            })
            .state('admin.student.loginLog', {
                url: '/loginLog',
                templateUrl: 'app/admin/studentLoginLog.html'
            })
            .state('admin.userList', {
                url: '/users',
                templateUrl: 'app/admin/users.html',
                controller: 'AdminUserController',
                controllerAs: 'vm'
            })
            .state('admin.addUser', {
                url: '/addUser',
                templateUrl: 'app/admin/addUser.html'
            })
            .state('admin.orderList', {
                url: '/orders',
                templateUrl: 'app/admin/orderList.html',
                controller: 'AdminOrderListController',
                controllerAs: 'vm'
            })
            .state('admin.lms', {
                url: '/lms',
                templateUrl: 'app/admin/lms.html',
                controller: 'AdminLMSController',
                controllerAs: 'vm'
            })
            .state('admin.lms.courses', {
                url: '/courses',
                templateUrl: 'app/admin/courses.html'
            })
            .state('admin.lms.editCourse', {
                url: '/editCourse',
                templateUrl: 'app/admin/createCourse.html'
            })
            .state('admin.lms.students', {
                url: '/students',
                templateUrl: 'app/admin/studentsCourse.html'
            })
            .state('admin.lms.courseCategories', {
                url: '/categories',
                templateUrl: 'app/admin/categories.html'
            })
            .state('admin.lms.editCategory', {
                url: '/editCategory',
                templateUrl: 'app/admin/createCategory.html'
            })
            .state('admin.lms.units', {
                url: '/units',
                templateUrl: 'app/admin/units.html'
            })
            .state('admin.lms.editUnit', {
                url: '/editUnit',
                templateUrl: 'app/admin/createUnit.html'
            })
            .state('admin.lms.callrequest', {
                url: '/callrequests',
                templateUrl: 'app/admin/coursesCallrequest.html'
            })
            .state('admin.lms.coursesReview', {
                url: '/coursesReview',
                templateUrl: 'app/admin/coursesReview.html'
            })
            .state('admin.lms.setting', {
                url: '/setting',
                templateUrl: 'app/admin/lmsSetting.html'
            })
            .state('admin.settings', {
                url: '/settings',
                templateUrl: 'app/admin/settings.html',
                controller: 'AdminSettingsController',
                controllerAs: 'vm'
            })
            .state('admin.settings.homePage', {
                url: '/homePage',
                templateUrl: 'app/admin/homePageSetting.html'
            })
            .state('admin.settings.subCategories', {
                url: '/subLevel',
                templateUrl: 'app/admin/homePageSubcategories.html'
            })
            .state('admin.settings.paymentMethods', {
                url: '/paymentMethods',
                templateUrl: 'app/admin/paymentMethods.html'
            });

        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }

})();
