'use strict';

angular.module('openappstore', ['ui.router']);

angular.module('openappstore').config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider.state('main', {
        url: '/',
        templateUrl: '/partials/main.html',
    }).state('docs', {
        url: '/docs',
        templateUrl: '/partials/docs.html',
    }).state('submit', {
        url: '/submit',
        templateUrl: '/partials/submit.html',
        controller: 'submitCtrl'
    }).state('apps', {
        url: '/apps',
        templateUrl: '/partials/apps.html',
        controller: 'appsCtrl'
    }).state('app', {
        url: '/app/:name',
        templateUrl: '/partials/app.html',
        controller: 'appsCtrl'
    });

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|scope):/);
});
