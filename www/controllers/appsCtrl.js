'use strict';

angular.module('openstore').controller('appsCtrl', function($scope, $state, $http) {
    $scope.apps = {};
    $scope.app = null;
    $scope.tab = 'contents';

    $http.get('/api/apps').then(function(response) {
        $scope.apps = response.data.data;

        if ($state.params.name) {
            angular.forEach($scope.apps, function(app) {
                if (app.id == $state.params.name) {
                    $scope.app = app;
                    $scope.tab = 'contents';
                }
            });
        }
    });

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
