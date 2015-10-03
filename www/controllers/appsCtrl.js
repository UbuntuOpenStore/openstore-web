'use strict';

angular.module('openstore').controller('appsCtrl', function($scope, $rootScope, $state, $http) {
    $scope.apps = {};
    $scope.app = null;
    $scope.tab = 'contents';
    $scope.manifest = false;

    $http.get('/api/apps').then(function(response) {
        $scope.apps = response.data.data;

        if ($state.params.name) {
            angular.forEach($scope.apps, function(app) {
                if (app.id == $state.params.name) {
                    $scope.app = app;$rootScope.setOG();
                    $scope.tab = 'contents';
                    $scope.manifest = false;
                }
            });
        }
    });

    $scope.$watch('app', function() {
        if ($scope.app) {
            $rootScope.setOG($scope.app.name, {
                title: $scope.app.name,
                description: $scope.app.tagline,
                image: $scope.app.icon,
                url: '{url}/app/' + $scope.app.id,
            });
        }
        else {
            $rootScope.setOG('OpenStore', {});
        }
    }, true);

    $scope.appType = function(hook) {
        var type = 'App';
        if (hook.dekstop) {
            type = 'App';
        }
        else if (hook.scope) {
            type = 'Scope';
        }
        else if (hook['push-helper']) {
            type = 'Push Helper';
        }

        return type;
    };
});
