'use strict';

angular.module('openstore').controller('appsCtrl', function($scope, $state, $http) {
    $scope.apps = {};
    $scope.app = null;
    $http.get('/api/apps').then(function(response) {
        $scope.apps = response.data.data;

        if ($state.params.name) {
            angular.forEach($scope.apps, function(app) {
                if (app.id == $state.params.name) {
                    $scope.app = app;
                }
            });
        }
    });
});
