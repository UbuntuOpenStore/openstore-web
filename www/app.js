window.jQuery = window.$ = require('jquery');
require('bootstrap');

var angular = require('angular');
var uirouter = require('angular-ui-router');
var uibootstrap = require('angular-ui-bootstrap');
var fileupload = require('ng-file-upload');

//TODO pretify these uris
require('./css/main.css');
require('./css/theme.css');
require('./node_modules/bootstrap/dist/css/bootstrap.min.css');
require('./node_modules/bootstrap/dist/css/bootstrap-theme.min.css');
require('./node_modules/font-awesome/css/font-awesome.min.css');

angular.module('openstore', [uirouter, uibootstrap, fileupload])
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider.state('main', {
        url: '/',
        templateUrl: '/app/partials/main.html',
    })
    .state('docs', {
        url: '/docs',
        templateUrl: '/app/partials/docs.html',
        controller: 'docsCtrl'
    })
    .state('submit', {
        url: '/submit',
        templateUrl: '/app/partials/submit.html',
        controller: 'submitCtrl'
    })
    .state('apps', {
        url: '/apps',
        templateUrl: '/app/partials/apps.html',
        controller: 'appsCtrl'
    })
    .state('app', {
        url: '/app/:name',
        templateUrl: '/app/partials/app.html',
        controller: 'appsCtrl'
    })
    .state('manage', {
        url: '/manage',
        templateUrl: '/app/partials/manage.html',
        controller: 'manageCtrl'
    });

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|scope|openstore):/);
})
.controller('indexCtrl', require('./app/controllers/indexCtrl'))
.controller('appsCtrl', require('./app/controllers/appsCtrl'))
.controller('manageCtrl', require('./app/controllers/manageCtrl'))
.controller('submitCtrl', require('./app/controllers/submitCtrl'))
.controller('docsCtrl', require('./app/controllers/docsCtrl'))
.directive('ngContent', require('./app/directives/ngContent'))
.directive('types', require('./app/directives/types'))
.filter('bytes', require('./app/filters/bytes'))
.filter('versionFix', require('./app/filters/versionFix'))
.filter('nl2br', require('./app/filters/nl2br'))
.factory('api', require('./app/services/api'))
.factory('info', require('./app/services/info'));
