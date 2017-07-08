(function() {
    'use strict';

    angular
        .module('flavido')
        .factory('CommonInfo', CommonInfo)
        .factory('RouterTracker', RouterTracker)
        .directive('whenScrollEnds', whenScrollEnds)
        .directive('reviewStars', reviewStars)
        .directive('fldSlider', fldSlider)
        .filter('htmlToPlaintext', htmlToPlaintext)
        .filter('charCodeToChar', charCodeToChar)
        .filter('truncate', truncate)
        .filter('INR', INR);

    /** @ngInject */
    function htmlToPlaintext() {
        return function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        }
    }

    /** @ngInject */
    function charCodeToChar() {
        return function(code) {
            return String.fromCharCode(code);
        }
    }

    /** @ngInject */
    function truncate() {
        return function(text, char) {
            return text.length > char ? text.substr(0, char) + '...' : text;
        }
    }

    /** @ngInject */
    function INR() {
        return function(input) {
            if (!isNaN(input)) {
                var currencySymbol = '₹ ';
                //var output = Number(input).toLocaleString('en-IN');   <-- This method is not working fine in all browsers!           
                var result = input.toString().split('.');

                var lastThree = result[0].substring(result[0].length - 3);
                var otherNumbers = result[0].substring(0, result[0].length - 3);
                if (otherNumbers != '')
                    lastThree = ',' + lastThree;
                var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

                if (result.length > 1) {
                    output += "." + result[1];
                }

                return currencySymbol + output;
            }
        }
    }

    /** @ngInject */
    function whenScrollEnds($window) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var visibleHeight = $window.innerHeight;
                var threshold = 100;

                element.scroll(function() {
                    var scrollableHeight = element.prop('scrollHeight');
                    var hiddenContentHeight = scrollableHeight - visibleHeight;

                    if (hiddenContentHeight - element.scrollTop() <= threshold) {
                        // Scroll is almost at the bottom. Loading more rows
                        scope.$apply(attrs.whenScrollEnds);
                    }
                });
            }
        };
    }

    /** @ngInject */
    function reviewStars(_) {
        return {
            restrict: "E",
            scope: {
                rating: '='
            },
            template: function(elem) {
                return "<span class='rating'><span class='star' ng-repeat='star in starLength track by $index' ng-class=\"{'starfull' : rating - $index >= 1, 'starhalf' : rating - $index > 0 && rating - $index < 1,  'starempty' : rating - $index <= 0 }\"></span></span>"
            },
            link: function(scope, element, attrs) {
                scope.starLength = _.fill(Array(parseInt(attrs.stars)), '*');
                //scope.rating = parseFloat(attrs.rating);
            }
        };
    }

    /** @ngInject */
    function fldSlider(_) {
        return {
            restrict: "E",
            scope: {
                step: '=',
                slidelist: '=',
                slides: '=',
                index: '='
            },
            transclude: true,
            template: function(elem) {
                return '<div ng-transclude></div><span ng-bind="slidelist.length"></span><div class="row"><div class="col-md-12"><div class="controls pull-right hidden-xs"><a class="left fa fa-chevron-left btn btn-primary" ng-disabled="index == 0" ng-click="index = index - step;"></a><a class="right fa fa-chevron-right btn btn-primary" ng-disabled="index + slides > data.length" ng-click="index = index + step;"></a></div></div></div>';
            },
            link: function(scope, element, attrs) {
                attrs.index = 0;
                console.log(scope.slidelist);
                //scope.starLength = _.fill(Array(parseInt(attrs.stars)), '*');
            },
            controller: function($scope, $element) {
                $scope.item;
            }
        };
    }

    /** @ngInject */
    function CommonInfo($localStorage, $state, $mdToast) {
        return {
            getInfoObj: function() {
                return angular.copy($localStorage.fInfoObj);
            },
            getInfo: function(item) {
                // if (!$localStorage.fInfoObj || !$localStorage.fInfoObj.user)
                //     $state.go('main');
                // else
                if ($localStorage && $localStorage.fInfoObj)
                    return angular.copy($localStorage.fInfoObj[item]);
                else
                    return {};
            },
            setInfo: function(item, value) {
                var obj = $localStorage.fInfoObj || {};
                obj[item] = angular.copy(value);
                $localStorage.fInfoObj = obj;
            },
            reset: function() {
                $localStorage.$reset();
            },
            getAppUrl: function() {
                return 'http://onlinementors.in/apidott/v0';
            },
            getTestSeriesAppUrl: function() {
                return 'http://onlinementors.in/testSeriesApi';
            },
            showAlert: function(text) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(text)
                    .hideDelay(3000)
                    .position('top right')
                );
            }
        };
    }

    function RouterTracker($rootScope) {
        var routeHistory = [];
        var service = {
            getRouteHistory: getRouteHistory,
            getPreviousRoute: getPreviousRoute
        };

        $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            routeHistory.push({ route: from, routeParams: fromParams });
        });

        function getRouteHistory() {
            return routeHistory;
        }

        function getPreviousRoute() {
            console.log('routeHistory');
            console.log(routeHistory);
            return routeHistory[routeHistory.length - 1];
        }

        return service;
    }
})();
