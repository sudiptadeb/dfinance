/**
 * Created by sudi-3385 on 25/10/17.
 */

var home = angular.module('home', [
    "dfinance.pages.stocks",
    "dfinance.commonComponents", 
    "dfinance.commonUtil", 
    "ngRoute", 
    "ngSanitize", 
    "ngMaterial", 
    "nvd3" 
]);

home.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/stocks'
        })
        .when('/stocks', {
            templateUrl : 'assets/src/modules/pages/stocks/stocks.html',
            controller  : 'stocksController as ctrl'
        })
        .when('/crypto', {
            templateUrl : 'assets/src/modules/pages/stocks/crypto.html',
            controller  : 'cryptoController as ctrl'
        })
        .when('/fx', {
            templateUrl : 'assets/src/modules/pages/fx/stocks.html',
            controller  : 'fxController as ctrl'
        })
});

home.controller('piiMainController',function ($scope, $rootScope) {

    $rootScope.alert = alert;
    $scope.profileSidenavOpen = false;

    $scope.sidenavList = [
        {
            name: 'Stocks',
            desc: 'NASDAQ Stocks Rates',
            link: '#/stocks',
            disabled: false,
            icon_type: 'icon',
            icon: 'fa fa-fw fa-line-chart'
        }
    ];

    $scope.userDetails = {
        name:'Sudipta Deb',
        email:'sudipta.deb@zohocorp.com',
        image:'assets/src/images/user-image.png' 
    }
});


