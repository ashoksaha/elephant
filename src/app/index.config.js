(function() {
    'use strict';

    angular
        .module('flavido')
        .factory('flavidoInterceptor', flavidoInterceptor)
        .config(config);

    /** @ngInject */
    function config($logProvider, $httpProvider, ADMdtpProvider, growlProvider, cfpLoadingBarProvider, blockUIConfig, ngMetaProvider) {
        // Enable log
        $logProvider.debugEnabled(true);

        growlProvider.onlyUniqueMessages(false);
        growlProvider.globalTimeToLive(5000);

        $httpProvider.interceptors.push('flavidoInterceptor');

        ADMdtpProvider.setOptions({
            format: 'YYYY-MM-DD hh:mm',
            default: 'today'
        });

        blockUIConfig.requestFilter = function(config) {
            if (config.data && config.data.ignoreBlockUI) {
                return false;
            }
        };

        ngMetaProvider.setDefaultTitle('IAS Online Coaching Classes – Flavido - IAS Preparations Online');
        ngMetaProvider.setDefaultTag('description', 'IAS Online Coaching Classes by IAS Academy. Live Online Coaching Classes for IAS, UPSC Exam preparation for General studies, Current affairs & for all courses.');
        ngMetaProvider.setDefaultTag('keywords', 'ias, upsc, online, coaching, classes, preparation');
    }

    function flavidoInterceptor() {
        return {
            request: function(config) {
                if (!config.url.match(/testSeries/)) {
                    config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
                return config;
            }
        }
    }

})();
