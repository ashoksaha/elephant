(function() {
    'use strict';

    angular
        .module('flavido')
        .factory('flavidoInterceptor', flavidoInterceptor)
        .config(config);

    /** @ngInject */
    function config($logProvider, $httpProvider, ADMdtpProvider, growlProvider, $sceDelegateProvider) {
        // Enable log
        $logProvider.debugEnabled(true);

        growlProvider.onlyUniqueMessages(false);
        growlProvider.globalTimeToLive(5000);

        $httpProvider.interceptors.push('flavidoInterceptor');

        ADMdtpProvider.setOptions({
            format: 'YYYY-MM-DD hh:mm',
            default: 'today'
        });
    }

    function flavidoInterceptor() {
        return {
            request: function(config) {
                if(!config.url.match(/testSeries/)){
                    config.headers = {'Content-Type': 'application/x-www-form-urlencoded'}
                }
                return config;
            }
        }
    }

})();
